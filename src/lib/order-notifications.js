import { generateEmailTemplate, sendAdminNotification, sendEmail, ADMIN_EMAILS, createEmailTransporter, sendDeliveryNotification, DELIVERY_PERSONNEL_EMAILS } from './email';
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
  let title, content, adminTitle, adminContent, deliveryTitle, deliveryContent;
  let customerButtonText = 'Suivre ma commande';
  let customerButtonUrl = getOrderTrackingUrl(order._id);
  let adminButtonText = 'Gérer la commande';
  let adminButtonUrl = `${process.env.NEXTAUTH_URL || 'https://nlivrilik.vercel.app'}/admin/orders/${order._id}`;
  let deliveryButtonText = 'Voir les détails de la commande';
  let deliveryButtonUrl = `${process.env.NEXTAUTH_URL || 'https://nlivrilik.vercel.app'}/delivery/orders/${order._id}`; // Assuming a delivery portal path

  switch (newStatus) {
    case OrderStatus.CONFIRMED:
      title = 'Votre commande a été confirmée';
      content = `Bonjour ${order.contactInfo.fullName},<br><br>
                Bonne nouvelle ! Votre commande <strong>#${order._id.toString().substring(0,8).toUpperCase()}</strong> a été confirmée et sera traitée sous peu.`;
      adminTitle = `Commande #${order._id.toString().substring(0,8).toUpperCase()} Confirmée`;
      adminContent = `La commande <strong>#${order._id.toString().substring(0,8).toUpperCase()}</strong> de ${order.contactInfo.fullName} a été confirmée.`;
      break;
    case OrderStatus.PROCESSING:
      title = 'Votre commande est en préparation';
      content = `Bonjour ${order.contactInfo.fullName},<br><br>
                Votre commande <strong>#${order._id.toString().substring(0,8).toUpperCase()}</strong> est maintenant en cours de préparation. Nous vous tiendrons informé de la suite.`;
      adminTitle = `Commande #${order._id.toString().substring(0,8).toUpperCase()} en Préparation`;
      adminContent = `La commande <strong>#${order._id.toString().substring(0,8).toUpperCase()}</strong> de ${order.contactInfo.fullName} est passée au statut "En préparation".`;
      break;
    case OrderStatus.READY:
      title = 'Votre commande est prête';
      content = `Bonjour ${order.contactInfo.fullName},<br><br>
                Excellente nouvelle ! Votre commande <strong>#${order._id.toString().substring(0,8).toUpperCase()}</strong> est prête à être expédiée/récupérée.`;
      adminTitle = `Commande #${order._id.toString().substring(0,8).toUpperCase()} Prête`;
      adminContent = `La commande <strong>#${order._id.toString().substring(0,8).toUpperCase()}</strong> de ${order.contactInfo.fullName} est prête.`;
      // Notification pour le livreur si assigné
      if (order.deliveryDetails && order.deliveryDetails.assignedTo) {
        deliveryTitle = `Commande #${order._id.toString().substring(0,8).toUpperCase()} Prête pour Livraison`;
        deliveryContent = `La commande <strong>#${order._id.toString().substring(0,8).toUpperCase()}</strong> de ${order.contactInfo.fullName} est prête et vous a été assignée pour livraison.`;
      }
      break;
    case OrderStatus.IN_TRANSIT:
      title = 'Votre commande est en cours de livraison';
      content = `Bonjour ${order.contactInfo.fullName},<br><br>
                Votre commande <strong>#${order._id.toString().substring(0,8).toUpperCase()}</strong> est en cours de livraison. Vous pouvez suivre son avancée.`;
      adminTitle = `Commande #${order._id.toString().substring(0,8).toUpperCase()} en Cours de Livraison`;
      adminContent = `La commande <strong>#${order._id.toString().substring(0,8).toUpperCase()}</strong> de ${order.contactInfo.fullName} est maintenant en cours de livraison.`;
      // Notification pour le livreur
      deliveryTitle = `Livraison en Cours: Commande #${order._id.toString().substring(0,8).toUpperCase()}`;
      deliveryContent = `Vous avez commencé la livraison de la commande <strong>#${order._id.toString().substring(0,8).toUpperCase()}</strong>.`;
      break;
    case OrderStatus.DELIVERED:
      title = 'Votre commande a été livrée';
      content = `Bonjour ${order.contactInfo.fullName},<br><br>
                Nous sommes heureux de vous informer que votre commande <strong>#${order._id.toString().substring(0,8).toUpperCase()}</strong> a été livrée avec succès. Merci de votre confiance !`;
      adminTitle = `Commande #${order._id.toString().substring(0,8).toUpperCase()} Livrée`;
      adminContent = `La commande <strong>#${order._id.toString().substring(0,8).toUpperCase()}</strong> de ${order.contactInfo.fullName} a été marquée comme livrée.`;
      deliveryTitle = `Commande #${order._id.toString().substring(0,8).toUpperCase()} Livrée`;
      deliveryContent = `Vous avez marqué la commande <strong>#${order._id.toString().substring(0,8).toUpperCase()}</strong> comme livrée.`;
      break;
    case OrderStatus.CANCELLED:
      title = 'Votre commande a été annulée';
      content = `Bonjour ${order.contactInfo.fullName},<br><br>
                Votre commande <strong>#${order._id.toString().substring(0,8).toUpperCase()}</strong> a été annulée conformément à votre demande ou suite à un problème. 
                N'hésitez pas à nous contacter pour plus d'informations.`;
      adminTitle = `Commande #${order._id.toString().substring(0,8).toUpperCase()} Annulée`;
      adminContent = `La commande <strong>#${order._id.toString().substring(0,8).toUpperCase()}</strong> de ${order.contactInfo.fullName} a été annulée.`;
      if (order.deliveryDetails && order.deliveryDetails.assignedTo) {
        deliveryTitle = `Commande #${order._id.toString().substring(0,8).toUpperCase()} Annulée`;
        deliveryContent = `La commande <strong>#${order._id.toString().substring(0,8).toUpperCase()}</strong> qui vous était assignée a été annulée.`;
      }
      break;
    default:
      console.log(`Aucune notification configurée pour le statut: ${newStatus}`);
      return { message: "Aucune notification pour ce statut." };
  }

  try {
    // Email au client
    if (order.contactInfo && order.contactInfo.email) {
      const customerEmailHtml = generateOrderEmailTemplate({
        title,
        content,
        order,
        buttonText: customerButtonText,
        buttonUrl: customerButtonUrl
      });
      await sendEmail({
        to: order.contactInfo.email,
        subject: `NLIVRILIK - Mise à jour de votre commande #${order._id.toString().substring(0,8).toUpperCase()}`,
        html: customerEmailHtml
      });
      console.log(`Notification de changement de statut envoyée au client pour la commande ${order._id}`);
    } else {
      console.warn(`Email du client non disponible pour la commande ${order._id}`);
    }

    // Email aux administrateurs
    if (ADMIN_EMAILS.length > 0) {
      const adminEmailHtml = generateOrderEmailTemplate({
        title: adminTitle,
        content: adminContent,
        order,
        buttonText: adminButtonText,
        buttonUrl: adminButtonUrl
      });
      await sendAdminNotification({
        subject: `NLIVRILIK - Changement de statut: Commande #${order._id.toString().substring(0,8).toUpperCase()} (${statusTranslation})`,
        html: adminEmailHtml
      });
      console.log(`Notification de changement de statut envoyée aux admins pour la commande ${order._id}`);
    }

    // Email aux livreurs concernés (si applicable et configuré)
    if (deliveryTitle && deliveryContent && DELIVERY_PERSONNEL_EMAILS.length > 0) {
        // Potentiellement, vous voudrez envoyer uniquement au livreur assigné si cette info est dans order.deliveryDetails.assignedTo.email
        // Pour l'instant, envoi à tous les livreurs configurés dans DELIVERY_PERSONNEL_EMAILS
        // ou à un livreur spécifique si l'information est disponible et que vous adaptez la logique.
        let deliveryRecipients = [...DELIVERY_PERSONNEL_EMAILS];
        // Exemple: si vous avez l'email du livreur assigné:
        // if (order.deliveryDetails && order.deliveryDetails.assignedTo && order.deliveryDetails.assignedTo.email) {
        //   deliveryRecipients = [order.deliveryDetails.assignedTo.email]; 
        // }

        if (deliveryRecipients.length > 0) {
            const deliveryEmailHtml = generateOrderEmailTemplate({
                title: deliveryTitle,
                content: deliveryContent,
                order,
                buttonText: deliveryButtonText,
                buttonUrl: deliveryButtonUrl
            });
            await sendDeliveryNotification({
                to: deliveryRecipients, // S'assurer que sendDeliveryNotification peut prendre un tableau `to` ou ajuste l'appel
                subject: `NLIVRILIK - Mise à jour livraison: Commande #${order._id.toString().substring(0,8).toUpperCase()} (${statusTranslation})`,
                html: deliveryEmailHtml
            });
            console.log(`Notification de changement de statut envoyée aux livreurs pour la commande ${order._id}`);
        }
    }

    return { success: true, message: `Notifications envoyées pour le statut ${newStatus}` };

  } catch (error) {
    console.error(`Erreur lors de l'envoi des notifications de changement de statut pour la commande ${order._id}:`, error);
    return { success: false, error: error.message };
  }
}
