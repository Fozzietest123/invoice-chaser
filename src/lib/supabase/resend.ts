import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReminderEmail(
  to: string,
  subject: string,
  htmlContent: string
) {
  // Inject a tracking pixel
  const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/track?email=${to}" width="1" height="1" style="display:none" />`;
  const finalHtml = `${htmlContent}${trackingPixel}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Invoice Chaser <onboarding@resend.dev>', // CHANGE THIS in production to your verified domain
      to: [to],
      subject: subject,
      html: finalHtml,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (e) {
    console.error('Send Error:', e);
    return { success: false, error: e };
  }
}