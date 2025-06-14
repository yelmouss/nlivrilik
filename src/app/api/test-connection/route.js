import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { sendEmail, createEmailTransporter, ADMIN_EMAILS } from '@/lib/email';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connected successfully' 
    });
  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to connect to database', 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { action } = await request.json();
    
    if (action === 'test-email') {
      console.log('Testing email connection...');
      
      // Vérifier la configuration SMTP
      const config = {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        user: process.env.EMAIL_SERVER_USER,
        from: process.env.EMAIL_FROM,
        adminEmails: ADMIN_EMAILS
      };
      
      console.log('Email configuration:', {
        host: config.host,
        port: config.port,
        user: config.user,
        from: config.from,
        adminEmails: config.adminEmails
      });
      
      // Tester la connexion au serveur SMTP
      const transporter = createEmailTransporter();
      const verifyResult = await transporter.verify();
      
      // Envoyer un email de test
      const testResult = await sendEmail({
        to: config.user, // Envoyer à l'adresse de l'expéditeur pour tester
        subject: 'Test de connexion NLIVRILIK',
        html: `
          <h1>Test de connexion email NLIVRILIK</h1>
          <p>Ceci est un email de test pour vérifier que la connexion au serveur SMTP fonctionne correctement.</p>
          <p>Date et heure du test: ${new Date().toLocaleString()}</p>
        `
      });
      
      return NextResponse.json({
        status: 'success',
        message: 'Email test completed',
        config: {
          host: config.host,
          port: config.port,
          user: config.user?.substring(0, 5) + '...',
          from: config.from,
          adminEmails: config.adminEmails
        },
        verifyResult,
        testResult
      });
    }
    
    return NextResponse.json({
      status: 'error',
      message: 'Invalid action'
    }, { status: 400 });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Email test failed',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
