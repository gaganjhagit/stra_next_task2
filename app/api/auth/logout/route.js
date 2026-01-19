import { NextResponse } from 'next/server';
import { clearAuthToken } from '@/lib/auth.js';

export async function POST(request) {
  try {
    await clearAuthToken();
    
    // Redirect to login page
    return NextResponse.redirect(new URL('/login', request.url), {
      status: 302,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Logout failed' },
      { status: 500 }
    );
  }
}
