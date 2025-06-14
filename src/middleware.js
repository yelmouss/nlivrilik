import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });
  const isAuthenticated = !!token;
  
  // Protéger les routes qui nécessitent une authentification
  if (req.nextUrl.pathname.startsWith('/my-orders') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }
  
  // Rediriger les utilisateurs déjà connectés des pages d'authentification vers "My Orders"
  if ((req.nextUrl.pathname.startsWith('/auth/signin') || 
       req.nextUrl.pathname.startsWith('/auth/signup')) && 
      isAuthenticated) {
    return NextResponse.redirect(new URL('/my-orders', req.url));
  }
  
  return NextResponse.next();
}

// Configurer les chemins sur lesquels le middleware s'exécutera
export const config = {
  matcher: ['/my-orders/:path*', '/auth/signin', '/auth/signup'],
};
