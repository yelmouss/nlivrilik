import jwt from 'jsonwebtoken';

export function signJwtToken(payload, options = {}) {
  const { expiresIn = '30d' } = options;
  const secret = process.env.NEXTAUTH_SECRET;
  
  if (!secret) {
    throw new Error('JWT secret is not defined');
  }
  
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyJwtToken(token) {
  const secret = process.env.NEXTAUTH_SECRET;
  
  if (!secret) {
    throw new Error('JWT secret is not defined');
  }
  
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
