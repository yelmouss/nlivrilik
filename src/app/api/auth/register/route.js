import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import User, { UserRoles } from '@/models/User';
import dbConnect from '@/lib/mongoose';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    console.log(`Attempting to register user: ${email}`);

    try {
      // Connect to the database with Mongoose
      await dbConnect();
      console.log('Connected to MongoDB in register route');

      // Check if user exists with Mongoose
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log(`User already exists with email: ${email}`);
        return NextResponse.json({ message: "User already exists." }, { status: 409 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Validate role if provided
      let userRole = UserRoles.USER;
      if (role && Object.values(UserRoles).includes(role)) {
        userRole = role;
      }
      
      // Generate verification token
      const token = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date();
      tokenExpires.setHours(tokenExpires.getHours() + 24); // Token expires in 24 hours
      
      // Create user with Mongoose
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: userRole,
        emailVerified: null,
        verificationToken: token,
        verificationTokenExpires: tokenExpires,
        image: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedUser = await user.save();
      console.log(`User registered successfully with ID: ${savedUser._id}`);      // Send verification email
      try {
        // Generate verification URL
        const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.get('host')}`;
        const verificationUrl = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
        
        // Send email
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
        
        console.log(`Verification email sent to: ${email}`);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Continue even if email sending fails, but inform the user
        return NextResponse.json({ 
          message: "User registered but verification email could not be sent. Please try resending from the verification page.", 
          userId: savedUser._id,
          role: savedUser.role,
          emailSent: false,
          emailError: emailError.message
        }, { status: 201 });
      }

      return NextResponse.json({ 
        message: "User registered. Please check your email to verify your account.", 
        userId: savedUser._id,
        role: savedUser.role,
        emailSent: true
      }, { status: 201 });
    } catch (dbError) {
      console.error("Database error in register route:", dbError);
      return NextResponse.json({ 
        message: "Database connection error", 
        error: dbError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
        return NextResponse.json({ message: "User with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ 
      message: "An error occurred while registering the user.", 
      error: error.message 
    }, { status: 500 });
  }
}
