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
      error: error.message
    }, { status: 500 });
  }
}
