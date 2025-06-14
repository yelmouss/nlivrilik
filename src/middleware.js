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
  
  // Protéger les routes d'administration - seuls les utilisateurs avec le rôle ADMIN peuvent y accéder
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
    
    // Vérifier si l'utilisateur a le rôle ADMIN
    if (token.role !== 'ADMIN') {
      // Rediriger vers la page d'accueil ou afficher une page d'erreur
      return NextResponse.redirect(new URL('/', req.url));
    }
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
  matcher: ['/my-orders/:path*', '/admin/:path*', '/auth/signin', '/auth/signup'],
};
