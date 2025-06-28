import { sendEmail, sendAdminNotification, ADMIN_EMAILS } from '@/lib/email';

export async function POST(req) {
  try {
    const { fullName, email, subject, message } = await req.json();

    if (!fullName || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: 'Tous les champs sont requis.' }), { status: 400 });
    }

    // Email de confirmation à l'utilisateur
    const userHtml = `
      <h2>Merci de nous avoir contactés</h2>
      <p>Bonjour ${fullName},</p>
      <p>Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.</p>
      <hr />
      <p><strong>Votre message :</strong></p>
      <p><strong>Sujet :</strong> ${subject}</p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <br>
      <p>L'équipe NLIVRILIK</p>
    `;
    await sendEmail({
      to: email,
      subject: 'NLIVRILIK - Confirmation de réception de votre message',
      html: userHtml
    });

    // Email aux admins
    const adminHtml = `
      <h2>Nouveau message de contact</h2>
      <p><strong>Nom :</strong> ${fullName}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Sujet :</strong> ${subject}</p>
      <p><strong>Message :</strong><br>${message.replace(/\n/g, '<br>')}</p>
    `;
    await sendAdminNotification({
      subject: `NLIVRILIK - Nouveau message de contact : ${subject}`,
      html: adminHtml
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Contact API error:', error);
    return new Response(JSON.stringify({ error: "Erreur lors de l'envoi du message." }), { status: 500 });
  }
}
