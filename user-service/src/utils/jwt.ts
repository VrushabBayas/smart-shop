import { createSecretKey } from 'node:crypto';
import { jwtVerify, SignJWT } from 'jose';
import env from '../../env';

export interface JwtPayload {
  username: string;
  iat?: number;
  exp?: number;
  id: string;
  email: string;
}

export const generateToken = async (payload: JwtPayload): Promise<string> => {
  const secretKey = createSecretKey(env.JWT_SECRET, 'utf-8');
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secretKey);
};

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const secretKey = createSecretKey(env.JWT_SECRET, 'utf-8');
  const { payload } = await jwtVerify(token, secretKey);
  return payload as unknown as JwtPayload;
};
