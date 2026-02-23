import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!);

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
    You are an AI assistant for an invoicing app. Write a professional invoice reminder email.
    
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
    - Respond strictly in JSON format: { "subject": "Subject Here", "body": "Email body here" }.
  `;

  try {
    // Use Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown formatting if present (Gemini sometimes adds ```json ... ```)
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(cleanedText);
    
    return {
      subject: parsed.subject || `Reminder: Invoice #${invoiceNumber}`,
      body: parsed.body || 'Error generating email body.',
    };

  } catch (error) {
    console.error('Gemini Generation Error:', error);
    // Fallback in case of parsing error
    return {
      subject: `Reminder: Invoice #${invoiceNumber}`,
      body: `Hi ${clientName},\n\nThis is a reminder that invoice #${invoiceNumber} for $${amount.toFixed(2)} was due on ${dueDate}.\n\nPlease remit payment at your earliest convenience.\n\nBest,\nThe Invoice Chaser Team`,
    };
  }
}