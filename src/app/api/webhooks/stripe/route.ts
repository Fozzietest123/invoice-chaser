import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin'; // Use admin client to bypass RLS

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

export async function POST(req: Request) {
  const body = await req.text(); // Read body as text for signature verification
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Get User ID from metadata
    const userId = session.metadata?.userId;

    if (userId) {
      const supabase = createAdminClient();
      
      // Update the user's profile to 'basic'
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'basic',
          stripe_customer_id: session.customer as string 
        })
        .eq('id', userId);

      if (error) {
        console.error('Supabase Update Error:', error);
        return NextResponse.json({ error: 'DB Update Failed' }, { status: 500 });
      }
      
      console.log(`User ${userId} upgraded to Basic.`);
    }
  }

  return NextResponse.json({ received: true });
}