import { createAdminClient } from '@/lib/supabase/admin';
import { generateReminderEmail } from '@/lib/openai';
import { sendReminderEmail } from '@/lib/supabase/resend';
import { NextResponse } from 'next/server';
import { differenceInDays, parseISO, format } from 'date-fns';

export async function GET(request: Request) {
  // Security: Verify Cron Secret OR Vercel Cron Header
  const authHeader = request.headers.get('authorization');
  const isVercelCron = request.headers.get('x-vercel-cron') === 'true';

  if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  
  // 1. Fetch all pending invoices and join with profiles
  // We use the admin client to bypass RLS
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*, profiles!inner(reminder_usage_count, subscription_status, email)')
    .eq('status', 'pending');

  if (error || !invoices) {
    console.error('DB Fetch Error', error);
    return NextResponse.json({ error: 'DB Error' }, { status: 500 });
  }

  const results = [];

  for (const inv of invoices) {
    const today = new Date();
    const dueDate = parseISO(inv.due_date);
    const daysDiff = differenceInDays(today, dueDate);
    
    // Type assertion for the joined profile data
    const profile = inv.profiles as any; 

    // Triggers: 3 days before ( -3 ), 1 day after ( 1 ), 7 days after ( 7 ), 14 days after ( 14 )
    const triggers = [-3, 1, 7, 14];
    const reminderKey = `d${daysDiff}`; 

    const sentHistory = inv.reminders_sent || {};
    
    // Check if today matches a trigger day AND we haven't already sent this specific reminder
    if (triggers.includes(daysDiff) && !sentHistory[reminderKey]) {
      
      // 2. Check Quota
      if (profile.subscription_status === 'free' && profile.reminder_usage_count >= 10) {
        results.push({ id: inv.id, status: 'skipped_limit_reached' });
        continue;
      }

      // 3. Generate AI Email
      try {
        const { subject, body } = await generateReminderEmail({
          clientName: inv.client_name,
          amount: inv.amount,
          invoiceNumber: inv.invoice_number,
          dueDate: format(dueDate, 'MMM dd, yyyy'),
          daysOverdue: Math.max(0, daysDiff),
          notes: inv.notes,
        });

        // 4. Send Email
        const sendResult = await sendReminderEmail(inv.client_email, subject, body);

        if (sendResult.success) {
          // 5. Update DB
          const newHistory = { ...sentHistory, [reminderKey]: new Date().toISOString() };
          
          await supabase
            .from('invoices')
            .update({ reminders_sent: newHistory })
            .eq('id', inv.id);

          await supabase
            .from('profiles')
            .update({ reminder_usage_count: profile.reminder_usage_count + 1 })
            .eq('id', inv.user_id);

          results.push({ id: inv.id, status: 'sent', to: inv.client_email });
        } else {
          results.push({ id: inv.id, status: 'failed_send' });
        }
      } catch (e) {
        console.error(`Error processing invoice ${inv.id}`, e);
        results.push({ id: inv.id, status: 'error' });
      }
    }
  }

  return NextResponse.json({ processed: results.length, details: results });
}