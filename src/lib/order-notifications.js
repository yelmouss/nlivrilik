import { generateEmailTemplate, sendAdminNotification, sendEmail, ADMIN_EMAILS, createEmailTransporter } from './email';
import { generateOrderEmailTemplate } from './email-templates';
import OrderStatus from '@/models/OrderStatus';

/**
 * Traduit le statut de commande en français
 * @param {string} status - Statut de commande
 * @returns {string} Statut traduit
 */
export function getStatusTranslation(status) {
  const translations = {
    [OrderStatus.PENDING]: 'En attente',
    [OrderStatus.CONFIRMED]: 'Confirmée',
    [OrderStatus.PROCESSING]: 'En préparation',
    [OrderStatus.READY]: 'Prête',
    [OrderStatus.IN_TRANSIT]: 'En cours de livraison',
    [OrderStatus.DELIVERED]: 'Livrée',
    [OrderStatus.CANCELLED]: 'Annulée'
  };
  
  return translations[status] || status;
}

/**
 * Génère l'URL de suivi pour une commande
 * @param {string} orderId - ID de la commande
 * @returns {string} URL de suivi
 */
function getOrderTrackingUrl(orderId) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://nlivrilik.vercel.app';
  return `${baseUrl}/my-orders?order=${orderId}`;
}

/**
 * Formate les détails de la commande pour l'email
 * @param {Object} order - Objet commande
 * @returns {Array} Détails formatés
 */
function formatOrderDetails(order) {
  return [
    { label: 'Numéro de commande', value: order._id.toString() },
    { label: 'Date de commande', value: new Date(order.createdAt).toLocaleString('fr-FR') },
    { label: 'Statut', value: getStatusTranslation(order.status) },
    { label: 'Client', value: order.contactInfo.fullName },
    { label: 'Email', value: order.contactInfo.email },
    { label: 'Téléphone', value: order.contactInfo.phoneNumber },
    { label: 'Adresse de livraison', value: order.deliveryAddress.formattedAddress },
    { label: 'Contenu de la commande', value: order.orderContent }
  ];
}

/**
 * Envoie une notification pour une nouvelle commande
 * @param {Object} order - La commande créée
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function sendNewOrderNotification(order) {
  console.log('Preparing to send order notification for order:', order._id.toString());
  
  try {
    if (!order || !order.contactInfo || !order.contactInfo.email) {
      console.error('Invalid order data or missing email:', order);
      throw new Error('Invalid order data or missing email');
    }
    
    // Log des destinataires
    console.log('Customer email:', order.contactInfo.email);
    console.log('Admin emails:', ADMIN_EMAILS);
    
    // Email au client avec le template élaboré
    const customerEmailHtml = generateOrderEmailTemplate({
      title: 'Votre commande a été reçue',
      content: `Bonjour ${order.contactInfo.fullName},<br><br>
                Nous avons bien reçu votre commande. Merci de votre confiance ! 
                Notre équipe va traiter votre demande dans les plus brefs délais.`,
      order,
      buttonText: 'Suivre ma commande',
      buttonUrl: getOrderTrackingUrl(order._id)
    });
    
    // Email aux administrateurs avec le template élaboré
    const adminEmailHtml = generateOrderEmailTemplate({
      title: 'Nouvelle commande reçue',
      content: `Une nouvelle commande a été créée et nécessite votre attention.`,
      order,
      buttonText: 'Gérer la commande',
      buttonUrl: `${process.env.NEXTAUTH_URL || 'https://nlivrilik.vercel.app'}/admin/orders/${order._id}`
    });
    
    console.log('Email templates generated successfully');
    
    // Vérifier la connexion SMTP avant d'envoyer
    const transporter = createEmailTransporter();
    try {
      const verifyResult = await transporter.verify();
      console.log('SMTP connection verified:', verifyResult);
    } catch (smtpError) {
      console.error('SMTP verification failed:', smtpError);
      throw new Error(`SMTP connection failed: ${smtpError.message}`);
    }
    
    // Envoi des emails séquentiellement pour une meilleure traçabilité
    console.log('Sending email to customer...');
    const customerResult = await sendEmail({
      to: order.contactInfo.email,
      subject: 'NLIVRILIK - Confirmation de votre commande',
      html: customerEmailHtml
    });
    
    console.log('Customer email result:', customerResult);
    
    console.log('Sending email to admins...');
    const adminResult = await sendAdminNotification({
      subject: 'NLIVRILIK - Nouvelle commande #' + order._id,
      html: adminEmailHtml
    });
    
    console.log('Admin email result:', adminResult);
    
    return {
      customerEmail: customerResult,
      adminEmail: adminResult
    };
  } catch (error) {    console.error('Error in sendNewOrderNotification:', error);
    console.error('Stack trace:', error.stack);
    throw error; // Relancer l'erreur pour la gestion en amont
  }
}

/**
 * Envoie une notification pour un changement de statut de commande
 * @param {Object} order - La commande mise à jour
 * @param {string} previousStatus - Statut précédent
 * @param {string} newStatus - Nouveau statut
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function sendOrderStatusChangeNotification(order, previousStatus, newStatus) {
  const statusTranslation = getStatusTranslation(newStatus);
  
  // Déterminer le titre et le contenu en fonction du nouveau statut
  let title, content;
  
  switch (newStatus) {
    case OrderStatus.CONFIRMED:
      title = 'Votre commande a été confirmée';
      content = `Bonjour ${order.contactInfo.fullName},<br><br>
                Bonne nouvelle ! Votre commande a été confirmée et sera traitée sous peu.`;
      break;
    case OrderStatus.PROCESSING:
      title = 'Votre commande est en préparation';
      content = `Bonjour ${order.contactInfo.fullName},<br><br>
                Nous préparons actuellement votre commande.`;
      break;
    case OrderStatus.READY:
      title = 'Votre commande est prête';
      content = `Bonjour ${order.contactInfo.fullName},<br><br>
                Votre commande est prête et va bientôt être confiée à notre livreur.`;
      break;
    case OrderStatus.IN_TRANSIT:
      title = 'Votre commande est en cours de livraison';
      content = `Bonjour ${order.contactInfo.fullName},<br><br>
                Votre commande est en route ! Notre livreur est en chemin vers l'adresse que vous avez indiquée.`;
      break;
    case OrderStatus.DELIVERED:
      title = 'Votre commande a été livrée';
      content = `Bonjour ${order.contactInfo.fullName},<br><br>
                Votre commande a été livrée avec succès. Nous espérons que vous êtes satisfait(e) de notre service.`;
      break;
    case OrderStatus.CANCELLED:
      title = 'Votre commande a été annulée';
      content = `Bonjour ${order.contactInfo.fullName},<br><br>
                Votre commande a été annulée. Si vous avez des questions concernant cette annulation, n'hésitez pas à nous contacter.`;
      break;
    default:
      title = 'Mise à jour de votre commande';
      content = `Bonjour ${order.contactInfo.fullName},<br><br>
                Le statut de votre commande a été mis à jour.`;
  }
  
  // Email au client avec le template élaboré
  const customerEmailHtml = generateOrderEmailTemplate({
    title,
    content,
    order,
    buttonText: 'Suivre ma commande',
    buttonUrl: getOrderTrackingUrl(order._id)
  });
  
  // Email aux administrateurs avec le template élaboré
  const adminEmailHtml = generateOrderEmailTemplate({
    title: `Statut de commande mis à jour: ${statusTranslation}`,
    content: `Le statut de la commande #${order._id} a changé de "${getStatusTranslation(previousStatus)}" à "${statusTranslation}".`,
    order,
    buttonText: 'Gérer la commande',
    buttonUrl: `${process.env.NEXTAUTH_URL || 'https://nlivrilik.vercel.app'}/admin/orders/${order._id}`
  });
  
  // Envoi des emails en parallèle
  const [customerResult, adminResult] = await Promise.all([
    sendEmail({
      to: order.contactInfo.email,
      subject: `NLIVRILIK - ${title}`,
      html: customerEmailHtml
    }),
    sendAdminNotification({
      subject: `NLIVRILIK - Commande #${order._id} - ${statusTranslation}`,
      html: adminEmailHtml
    })
  ]);
  
  return {
    customerEmail: customerResult,
    adminEmail: adminResult
  };
}
