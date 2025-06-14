// Utility to test email functionality

import { sendEmail, createEmailTransporter, ADMIN_EMAILS } from '@/lib/email';
import { generateOrderEmailTemplate } from '@/lib/email-templates';
import OrderStatus from '@/models/OrderStatus';

export default async function testEmailConfiguration() {
  try {
    console.log('Testing email configuration...');
    console.log('Email settings:');
    console.log({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      user: process.env.EMAIL_SERVER_USER,
      from: process.env.EMAIL_FROM,
      adminEmails: ADMIN_EMAILS
    });

    // Test SMTP connection
    const transporter = createEmailTransporter();
    console.log('Testing SMTP connection...');
    try {
      const verifyResult = await transporter.verify();
      console.log('SMTP connection successful:', verifyResult);
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return {
        success: false,
        message: 'SMTP connection failed',
        error: error.message
      };
    }

    // Send test email
    const testEmailHtml = generateOrderEmailTemplate({
      title: 'Test Email Configuration',
      content: 'Ceci est un email de test pour vérifier la configuration de notification des commandes.',
      order: {
        _id: 'TEST123456',
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        contactInfo: {
          fullName: 'Utilisateur Test',
          email: process.env.EMAIL_SERVER_USER,
          phoneNumber: '+1234567890'
        },
        deliveryAddress: {
          formattedAddress: '123 Rue de Test, Ville, Pays'
        },
        orderContent: 'Ceci est une commande de test.\nProduit 1\nProduit 2'
      },
      buttonText: 'Voir les détails',
      buttonUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/my-orders`
    });

    // Send to admin emails and to the sender email for testing
    const testResult = await sendEmail({
      to: [...ADMIN_EMAILS, process.env.EMAIL_SERVER_USER],
      subject: 'NLIVRILIK - Test de configuration des emails',
      html: testEmailHtml
    });

    console.log('Test email result:', testResult);
    return {
      success: true,
      message: 'Test email sent successfully',
      result: testResult
    };
  } catch (error) {
    console.error('Test email error:', error);
    return {
      success: false,
      message: 'Test email failed',
      error: error.message
    };
  }
}

export async function sendCustomTestEmail(email) {
  try {
    console.log(`Sending custom test email to ${email}...`);
    
    // Test SMTP connection first
    const transporter = createEmailTransporter();
    console.log('Testing SMTP connection...');
    try {
      const verifyResult = await transporter.verify();
      console.log('SMTP connection successful:', verifyResult);
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return {
        success: false,
        message: 'SMTP connection failed',
        error: error.message
      };
    }
    
    // Send test email with sample order template
    const testEmailHtml = generateOrderEmailTemplate({
      title: 'Test Email Configuration',
      content: `Ceci est un email de test envoyé à <strong>${email}</strong> pour vérifier la configuration de notification des commandes.`,
      order: {
        _id: 'TEST' + Date.now().toString().substring(8),
        status: OrderStatus.CONFIRMED,
        createdAt: new Date(),
        contactInfo: {
          fullName: 'Destinataire Test',
          email: email,
          phoneNumber: '+1234567890'
        },
        deliveryAddress: {
          formattedAddress: '123 Rue de Test, Ville, Pays'
        },
        orderContent: 'Ceci est une commande de test.\nProduit 1\nProduit 2\nProduit 3'
      },
      buttonText: 'Voir les détails',
      buttonUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/my-orders`
    });
    
    // Send the email
    const testResult = await sendEmail({
      to: email,
      subject: 'NLIVRILIK - Test de notification de commande',
      html: testEmailHtml
    });
    
    console.log('Custom test email result:', testResult);
    return {
      success: true,
      message: `Email de test envoyé avec succès à ${email}`,
      result: testResult
    };
  } catch (error) {
    console.error('Custom test email error:', error);
    return {
      success: false,
      message: 'Échec de l\'envoi de l\'email de test',
      error: error.message
    };
  }
}
