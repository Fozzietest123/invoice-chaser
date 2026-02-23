import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface EmailGenParams {
  clientName: string;
  amount: number;
  invoiceNumber: string;
  dueDate: string;
  daysOverdue: number;
  notes?: string | null;
}

export async function generateReminderEmail({
  clientName,
  amount,
  invoiceNumber,
  dueDate,
  daysOverdue,
  notes,
}: EmailGenParams): Promise<{ subject: string; body: string }> {
  // Determine tone based on days overdue
  let tone = 'friendly and casual';
  if (daysOverdue > 14) {
    tone = 'stern and urgent, mentioning potential service interruption or late fees';
  } else if (daysOverdue > 7) {
    tone = 'firm and professional, emphasizing the importance of prompt payment';
  } else if (daysOverdue >= 1) {
    tone = 'polite but clear reminder that the invoice is past due';
  } else {
    tone = 'friendly and helpful, just a gentle reminder';
  }

  const prompt = `
    Write a professional invoice reminder email.
    
    Context:
    - Client Name: ${clientName}
    - Invoice Number: #${invoiceNumber}
    - Amount: $${amount.toFixed(2)}
    - Due Date: ${dueDate}
    - Days Overdue: ${daysOverdue}
    - Additional Notes: ${notes || 'None'}
    
    Tone: ${tone}
    
    Requirements:
    - Keep it concise (under 150 words).
    - Include the invoice number in the subject line.
    - Do not use placeholder brackets like [Your Name]; sign off as "The Invoice Chaser Team".
    - Do not include payment links unless specifically provided in notes (assume manual payment for now).
  `;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }, 
  });

  const content = completion.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content || '{}');
    return {
      subject: parsed.subject || `Reminder: Invoice #${invoiceNumber}`,
      body: parsed.body || 'Error generating email body.',
    };
  } catch (e) {
    console.error("JSON Parse Error", e);
    return {
      subject: `Reminder: Invoice #${invoiceNumber}`,
      body: "Error generating AI content.",
    };
  }
}