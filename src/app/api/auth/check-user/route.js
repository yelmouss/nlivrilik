import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongoose';

export async function POST(req) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }
    
    console.log(`Checking user with email: ${email}`);
    
    try {
      // Connect to MongoDB with Mongoose
      await dbConnect();
      console.log('Connected to MongoDB in check-user route');
      
      // Find user with Mongoose
      const user = await User.findOne({ email });
      console.log('User search completed:', user ? 'User found' : 'User not found');

      if (user) {
        return NextResponse.json({ user: true });
      } else {
        return NextResponse.json({ user: false });
      }
    } catch (dbError) {
      console.error("Database error in check-user route:", dbError);
      return NextResponse.json({ 
        message: "Database connection error", 
        error: dbError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Check user error:", error);
    return NextResponse.json({ 
      message: "An error occurred while checking user", 
      error: error.message 
    }, { status: 500 });
  }
}
