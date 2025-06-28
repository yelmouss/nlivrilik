import nodemailer from "nodemailer";

/**
 * Configuration du transport d'emails
 * @returns {nodemailer.Transporter} Transporter pour envoyer des emails
 */
export function createEmailTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    secure: process.env.EMAIL_SERVER_PORT === "465", // Activer SSL pour le port 465
    tls: {
      // Ignorer les erreurs de certificat en développement
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
}

// Liste des emails administrateurs qui recevront toutes les notifications
export const ADMIN_EMAILS =
  process.env.ADMIN_EMAILS &&
  process.env.ADMIN_EMAILS.split(",").map((email) => email.trim());
// Ajoutez d'autres emails d'administrateurs si nécessaire

// Liste des emails des livreurs qui recevront les notifications de commande pertinentes
export const DELIVERY_PERSONNEL_EMAILS = process.env.DELIVERY_EMAILS
  ? process.env.DELIVERY_EMAILS.split(",").map((email) => email.trim())
  : []; // Par défaut, une liste vide si non défini

/**
 * Envoie un email avec un template HTML
 * @param {Object} options - Options d'envoi d'email
 * @param {string} options.to - Destinataire(s) de l'email
 * @param {string} options.subject - Sujet de l'email
 * @param {string} options.html - Contenu HTML de l'email
 * @param {string} [options.from] - Expéditeur (utilise EMAIL_FROM par défaut)
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.EMAIL_FROM,
}) {
  try {
    console.log(
      `Preparing to send email to ${
        Array.isArray(to) ? to.join(", ") : to
      } with subject: ${subject}`
    );
    console.log(
      `Email server config: ${process.env.EMAIL_SERVER_HOST}:${process.env.EMAIL_SERVER_PORT}`
    );

    // Vérifier les paramètres requis
    if (!to || !subject || !html) {
      throw new Error(
        "Missing required email parameters: to, subject, or html"
      );
    }

    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      throw new Error(
        "Missing email server credentials in environment variables"
      );
    }

    const transport = createEmailTransporter();
    console.log("Email transporter created successfully");

    // Objet de configuration de l'email
    const mailOptions = {
      from: from || `"NLIVRILIK" <${process.env.EMAIL_SERVER_USER}>`,
      to, // 'to' can be a string or an array of strings
      subject,
      html,
    };

    console.log("Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to, // Log the recipient(s)
      subject: mailOptions.subject,
    });

    const result = await transport.sendMail(mailOptions);

    console.log(
      `Email sent successfully to ${
        Array.isArray(to) ? to.join(", ") : to
      }. Message ID: ${result.messageId}`
    );
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    console.error("Error details:", error.stack);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie des emails aux administrateurs et optionnellement à d'autres destinataires
 * @param {Object} options - Options d'envoi
 * @param {string} options.subject - Sujet de l'email
 * @param {string} options.html - Contenu HTML de l'email
 * @param {string|Array} [options.additionalRecipients] - Destinataires supplémentaires
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function sendAdminNotification({
  subject,
  html,
  additionalRecipients = [],
}) {
  let recipients = [...ADMIN_EMAILS];

  if (typeof additionalRecipients === "string") {
    if (additionalRecipients) recipients.push(additionalRecipients);
  } else if (Array.isArray(additionalRecipients)) {
    recipients = [...recipients, ...additionalRecipients.filter((r) => r)];
  }

  // Ensure no duplicates and all are valid emails if further validation is needed
  const uniqueRecipients = [...new Set(recipients)];

  if (uniqueRecipients.length === 0) {
    console.log("No admin recipients configured for notification.");
    return { success: true, message: "No admin recipients." };
  }

  return sendEmail({
    to: uniqueRecipients,
    subject,
    html,
  });
}

// Nouvelle fonction pour envoyer des notifications aux livreurs
/**
 * Envoie des emails aux livreurs.
 * @param {Object} options - Options d'envoi
 * @param {string} options.subject - Sujet de l'email
 * @param {string} options.html - Contenu HTML de l'email
 * @param {string|Array} [options.additionalRecipients] - Destinataires supplémentaires (optionnel)
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function sendDeliveryNotification({
  subject,
  html,
  additionalRecipients = [],
}) {
  let recipients = [...DELIVERY_PERSONNEL_EMAILS];

  if (typeof additionalRecipients === "string") {
    if (additionalRecipients) recipients.push(additionalRecipients);
  } else if (Array.isArray(additionalRecipients)) {
    recipients = [...recipients, ...additionalRecipients.filter((r) => r)];
  }

  const uniqueRecipients = [...new Set(recipients)];

  if (uniqueRecipients.length === 0) {
    console.log(
      "No delivery personnel recipients configured for notification."
    );
    return { success: true, message: "No delivery personnel recipients." };
  }

  return sendEmail({
    to: uniqueRecipients,
    subject,
    html,
  });
}

/**
 * Génère un template HTML pour les emails de notification
 * @param {Object} options - Options du template
 * @param {string} options.title - Titre principal
 * @param {string} options.content - Contenu principal
 * @param {Object[]} [options.details] - Détails supplémentaires sous forme de paires clé-valeur
 * @param {string} [options.buttonText] - Texte du bouton d'action
 * @param {string} [options.buttonUrl] - URL du bouton d'action
 * @param {string} [options.footerText] - Texte du pied de page
 * @returns {string} Template HTML
 */
export function generateEmailTemplate({
  title,
  content,
  details = [],
  buttonText,
  buttonUrl,
  footerText = "© NLIVRILIK - Votre partenaire de livraison de confiance au Maroc.",
}) {
  const detailsHtml = details.length
    ? `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tbody>
          ${details
            .map(
              ({ label, value }) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">${label}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${value}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `
    : "";

  const buttonHtml =
    buttonText && buttonUrl
      ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${buttonUrl}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
          ${buttonText}
        </a>
      </div>
    `
      : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #4CAF50;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #777;
          font-size: 12px;
          border-top: 1px solid #eee;
          margin-top: 20px;
        }
        h1 {
          color: #4CAF50;
        }
        @media only screen and (max-width: 620px) {
          .container {
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://nlivrilik.vercel.app/logo.png" alt="NLIVRILIK Logo" class="logo">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <p>${content}</p>
          ${detailsHtml}
          ${buttonHtml}
        </div>
        <div class="footer">
          <p>${footerText}</p>
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
