/**
 * Ce fichier contient des templates HTML plus élaborés pour les emails de notification
 */

/**
 * Génère un template HTML pour les emails de notification de commande
 * @param {Object} options - Options du template
 * @param {string} options.title - Titre principal
 * @param {string} options.content - Contenu principal
 * @param {Object} options.order - Objet commande
 * @param {string} options.buttonText - Texte du bouton d'action
 * @param {string} options.buttonUrl - URL du bouton d'action
 * @returns {string} Template HTML
 */
export function generateOrderEmailTemplate({
  title,
  content,
  order,
  buttonText,
  buttonUrl
}) {
  // Formater les détails de la commande
  const orderContent = order.orderContent || '';
  const orderItems = orderContent.split('\n').map(item => `<li>${item.trim()}</li>`).join('');
  
  // Formater la date
  const date = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Formater l'adresse
  const address = order.deliveryAddress.formattedAddress || 'Adresse non spécifiée';
  
  // Déterminer la couleur en fonction du statut
  let statusColor = '#4CAF50'; // Vert par défaut
  
  switch (order.status) {
    case 'PENDING':
      statusColor = '#FFA000'; // Orange
      break;
    case 'CONFIRMED':
      statusColor = '#2196F3'; // Bleu
      break;
    case 'PROCESSING':
      statusColor = '#9C27B0'; // Violet
      break;
    case 'READY':
      statusColor = '#00BCD4'; // Cyan
      break;
    case 'IN_TRANSIT':
      statusColor = '#3F51B5'; // Indigo
      break;
    case 'DELIVERED':
      statusColor = '#4CAF50'; // Vert
      break;
    case 'CANCELLED':
      statusColor = '#F44336'; // Rouge
      break;
  }
  
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
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 0;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }
        .header {
          text-align: center;
          padding: 30px 0;
          background-color: #4CAF50;
          color: white;
        }
        .logo {
          max-width: 120px;
          height: auto;
          margin-bottom: 15px;
        }
        .content {
          padding: 30px;
        }
        .order-info {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .order-number {
          font-size: 1.2em;
          font-weight: bold;
          color: #4CAF50;
          margin-bottom: 10px;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: bold;
          color: white;
          background-color: ${statusColor};
          margin-bottom: 15px;
        }
        .info-row {
          display: flex;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .info-label {
          font-weight: bold;
          width: 40%;
          padding-right: 10px;
        }
        .info-value {
          width: 60%;
        }
        .divider {
          height: 1px;
          background-color: #eee;
          margin: 15px 0;
        }
        .items-list {
          margin: 15px 0;
          padding-left: 20px;
        }
        .button {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 4px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #777;
          font-size: 12px;
          border-top: 1px solid #eee;
          background-color: #f9f9f9;
        }
        .social-links {
          margin: 15px 0;
        }
        .social-icon {
          display: inline-block;
          margin: 0 5px;
          width: 30px;
          height: 30px;
        }
        @media only screen and (max-width: 620px) {
          .container {
            width: 100%;
            border-radius: 0;
          }
          .info-label, .info-value {
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
          
          <div class="order-info">
            <div class="order-number">Commande #${order._id.toString().substring(0, 8).toUpperCase()}</div>
            <div class="status-badge">${getStatusTranslation(order.status)}</div>
            
            <div class="info-row">
              <div class="info-label">Date :</div>
              <div class="info-value">${date}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Client :</div>
              <div class="info-value">${order.contactInfo.fullName}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Email :</div>
              <div class="info-value">${order.contactInfo.email}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Téléphone :</div>
              <div class="info-value">${order.contactInfo.phoneNumber}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="info-row">
              <div class="info-label">Adresse de livraison :</div>
              <div class="info-value">${address}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="info-label">Contenu de la commande :</div>
            <ul class="items-list">
              ${orderItems}
            </ul>
            
            ${order.deliveryDetails && order.deliveryDetails.estimatedDeliveryTime ? `
              <div class="info-row">
                <div class="info-label">Livraison estimée :</div>
                <div class="info-value">${new Date(order.deliveryDetails.estimatedDeliveryTime).toLocaleString('fr-FR')}</div>
              </div>
            ` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${buttonUrl}" class="button">${buttonText}</a>
          </div>
        </div>
        <div class="footer">
          <div class="social-links">
            <a href="https://facebook.com/nlivrilik" class="social-icon">
              <img src="https://cdn-icons-png.flaticon.com/128/3128/3128208.png" alt="Facebook" width="30" height="30">
            </a>
            <a href="https://instagram.com/nlivrilik" class="social-icon">
              <img src="https://cdn-icons-png.flaticon.com/128/3955/3955024.png" alt="Instagram" width="30" height="30">
            </a>
            <a href="https://twitter.com/nlivrilik" class="social-icon">
              <img src="https://cdn-icons-png.flaticon.com/128/5969/5969020.png" alt="Twitter" width="30" height="30">
            </a>
          </div>
          <p>© NLIVRILIK - Votre partenaire de livraison de confiance au Maroc.</p>
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Traduit le statut de commande en français
 * @param {string} status - Statut de commande
 * @returns {string} Statut traduit
 */
function getStatusTranslation(status) {
  const translations = {
    'PENDING': 'En attente',
    'CONFIRMED': 'Confirmée',
    'PROCESSING': 'En préparation',
    'READY': 'Prête',
    'IN_TRANSIT': 'En cours de livraison',
    'DELIVERED': 'Livrée',
    'CANCELLED': 'Annulée'
  };
  
  return translations[status] || status;
}
