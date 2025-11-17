import { generateToken } from '../utils/jwt';
import { hashPassword } from '../utils/password';
import { Request, Response } from 'express';

export const signUpUser = async (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  const hashedPassword = await hashPassword(password);

  // Dummy sign-up logic
  if (username && hashedPassword) {
    const token = await generateToken({ username });
    res.status(200).json({
      data: { message: 'Sign-Up Successful', token, error: null, username },
    });
  } else {
    res
      .status(400)
      .json({ data: null, message: 'Username and Password are required' });
  }
};
