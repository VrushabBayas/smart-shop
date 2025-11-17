import db from '../db/connection';
import { users } from '../db/schema';
import { generateToken } from '../utils/jwt';
import { hashPassword } from '../utils/password';
import { Request, Response } from 'express';

export const signUpUser = async (req: Request, res: Response) => {
  console.log('[log]req:', req.body);
  try {
    const { username, password } = req.body || {};
    const hashedPassword = await hashPassword(password);

    if (username && hashedPassword) {
      const hashedPassword = await hashPassword(password);
      const [user] = await db
        .insert(users)
        .values({
          ...req.body,
          password: hashedPassword,
        })
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
        });
      const token = await generateToken({
        username: user?.username || '',
        id: user?.id || '',
        email: user?.email || '',
      });
      res.status(200).json({
        data: { message: 'Sign-Up Successful', token, error: null, username },
      });
    } else {
      res
        .status(400)
        .json({ data: null, message: 'Username and Password are required' });
    }
  } catch (error) {
    console.error('Error during sign-up:', error);
    res.status(500).json({ data: null, message: 'Internal Server Error' });
  }
};
