import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';

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
