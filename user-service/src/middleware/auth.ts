import { Request, Response, NextFunction } from 'express';

import { JwtPayload, verifyToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ data: null, message: 'Unauthorized' });
    }
    const payload = await verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    console.error('Error during token verification:', error);
    res.status(403).json({ data: null, message: 'Forbidden' });
  }
};
