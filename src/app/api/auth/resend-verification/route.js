import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongoose';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }
    
    console.log(`Attempting to resend verification email to: ${email}`);
    
    try {
      // Connect to MongoDB with Mongoose
      await dbConnect();
      console.log('Connected to MongoDB in resend-verification route');
      
      // Find user with Mongoose
      const user = await User.findOne({ email });
      
      if (!user) {
        return NextResponse.json({ 
          message: "User not found", 
          success: false 
        }, { status: 404 });
      }

      if (user.emailVerified) {
        return NextResponse.json({ 
          message: "Email is already verified", 
          success: true,
          verified: true
        });
      }

      // Generate verification token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date();
      expires.setHours(expires.getHours() + 24); // Token expires in 24 hours
      
      // Save token to user
      user.verificationToken = token;
      user.verificationTokenExpires = expires;
      await user.save();
        // Generate verification URL
      const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.get('host')}`;
      const verificationUrl = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
        
      // Send email
      try {
        const transport = nodemailer.createTransport({
          host: process.env.EMAIL_SERVER_HOST,
          port: process.env.EMAIL_SERVER_PORT,
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD
          },
          tls: {
            rejectUnauthorized: false // Ignorer les problèmes de certificat auto-signé
          },
          secure: false // Try setting secure to false
        });
        
        await transport.sendMail({
          to: email,
          from: process.env.EMAIL_FROM,
          subject: "Vérifiez votre adresse email",
          html: `
            <div>
              <h1>Vérification de votre adresse email</h1>
              <p>Merci de vous être inscrit. Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
              <p><a href="${verificationUrl}">Vérifier mon email</a></p>
              <p>Ce lien est valable pendant 24 heures.</p>
            </div>
          `
        });
        
        return NextResponse.json({ 
          message: "Verification email sent", 
          success: true
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        return NextResponse.json({ 
          message: "Failed to send verification email", 
          error: emailError.message,
          success: false
        }, { status: 500 });
      }
    } catch (dbError) {
      console.error("Database error in resend-verification route:", dbError);
      return NextResponse.json({ 
        message: "Database connection error", 
        error: dbError.message,
        success: false
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ 
      message: "An error occurred while sending verification email", 
      error: error.message,
      success: false
    }, { status: 500 });
  }
}
