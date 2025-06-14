import { NextResponse } from 'next/server';
import testEmailConfiguration from '@/lib/test-email';

export async function GET() {
  try {
    const result = await testEmailConfiguration();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Test email API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Email test failed',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email address is required'
      }, { status: 400 });
    }
    
    // Import nécessaire ici pour éviter de surcharger la route GET
    const { sendCustomTestEmail } = await import('@/lib/test-email');
    
    const result = await sendCustomTestEmail(email);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Custom test email error:', error);
    return NextResponse.json({
      success: false,
      message: 'Custom email test failed',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
