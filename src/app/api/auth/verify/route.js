import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongoose';
import { signJwtToken } from '@/lib/jwt'; // Import for JWT signing (to be created)
import { cookies } from 'next/headers';
import { encode } from 'next-auth/jwt';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');
    
    if (!token || !email) {
      return NextResponse.redirect(`${url.origin}/auth/verify-email?error=missing_params`);
    }
    
    console.log(`Verifying email for user with token: ${token}`);
    
    try {
      // Connect to MongoDB with Mongoose
      await dbConnect();
      console.log('Connected to MongoDB in verify route');
      
      // Find user with the verification token
      const user = await User.findOne({ 
        email, 
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() }
      });
      
      if (!user) {
        return NextResponse.redirect(`${url.origin}/auth/verify-email?error=invalid_token`);
      }
      
      // Mark email as verified
      user.emailVerified = new Date();
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();

      // Create and sign JWT token for auto-login
      try {
        // Create session token for Next-Auth
        const sessionToken = await encode({
          token: {
            name: user.name,
            email: user.email,
            id: user._id.toString(),
            role: user.role || 'USER',
            sub: user._id.toString(),
          },
          secret: process.env.NEXTAUTH_SECRET
        });

        // Set session cookie
        const cookieStore = cookies();
        const maxAge = 30 * 24 * 60 * 60; // 30 days
        
        cookieStore.set("next-auth.session-token", sessionToken, {
          expires: new Date(Date.now() + maxAge * 1000),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          sameSite: "lax",
        });
        
        console.log('User auto-logged in after email verification');
        
        // Redirect to success page with auto-login message
        return NextResponse.redirect(`${url.origin}/auth/verify-email?success=true&autologin=true`);
      } catch (authError) {
        console.error("Error creating auth session:", authError);
        // If auto-login fails, still show success but without auto-login
        return NextResponse.redirect(`${url.origin}/auth/verify-email?success=true`);
      }
    } catch (dbError) {
      console.error("Database error in verify route:", dbError);
      return NextResponse.redirect(`${url.origin}/auth/verify-email?error=db_error`);
    }
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(`${url.origin}/auth/verify-email?error=server_error`);
  }
}
