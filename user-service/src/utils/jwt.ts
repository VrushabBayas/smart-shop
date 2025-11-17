import { createSecretKey } from 'node:crypto';
import { SignJWT } from 'jose';

export interface JwtPayload {
  username: string;
  iat?: number;
  exp?: number;
}

export const generateToken = async (payload: JwtPayload): Promise<string> => {
  const secretKey = createSecretKey('This is my secret key for JWT', 'utf-8');
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secretKey);
};
