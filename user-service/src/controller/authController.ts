import { eq } from 'drizzle-orm';
import db from '../db/connection';
import { users } from '../db/schema';
import { generateRefreshToken, generateToken } from '../utils/jwt';
import { comparePassword, hashPassword } from '../utils/password';
import { Request, Response } from 'express';

export const signUpUser = async (req: Request, res: Response) => {
  try {
    const { password } = req.body || {};
    const hashedPassword = await hashPassword(password);

    await db
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
    res.status(201).json({
      data: { message: 'Sign-Up Successful', error: null },
    });
  } catch (error) {
    console.error('Error during sign-up:', error);
    res.status(500).json({ data: null, message: 'Internal Server Error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .then((rows) => rows[0]);

    if (!user) {
      return res
        .status(401)
        .json({ data: null, message: 'Invalid credentials' });
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ data: null, message: 'Invalid credentials' });
    }

    const token = await generateToken({
      username: user.username,
      id: user.id,
      email: user.email,
    });
    // generate refresh token and save it to db
    const refreshToken = await generateRefreshToken(user.id);
    await db.update(users).set({ refreshToken }).where(eq(users.id, user.id));

    res.status(200).json({
      data: {
        message: 'Login Successful',
        token,
        error: null,
        username: user.username,
        id: user.id,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ data: null, message: 'Internal Server Error' });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.query.id;
    if (!userId || typeof userId !== 'string') {
      return res
        .status(400)
        .json({ data: null, message: 'User ID is required' });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((rows) => rows[0]);

    const {
      password,
      createdAt,
      updatedAt,
      refreshToken,
      ...userWithoutPassword
    } = user || {};

    if (!user) {
      return res.status(404).json({ data: null, message: 'User not found' });
    }
    res
      .status(200)
      .json({ data: userWithoutPassword, message: 'User profile fetched' });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ data: null, message: 'Internal Server Error' });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(400)
        .json({ data: null, message: 'Refresh token is required' });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.refreshToken, refreshToken))
      .limit(1)
      .then((rows) => rows[0]);

    if (!user) {
      return res.status(401).json({ data: null, message: 'Invalid token' });
    }

    const newAccessToken = await generateToken({
      username: user.username,
      id: user.id,
      email: user.email,
    });

    res.status(200).json({
      data: { accessToken: newAccessToken, message: 'Token refreshed' },
    });
  } catch (error) {
    console.error('Error refreshing access token:', error);
    res.status(500).json({ data: null, message: 'Internal Server Error' });
  }
};

export const passwordReset = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .then((rows) => rows[0]);
    if (!user) {
      return res.status(404).json({ data: null, message: 'User not found' });
    }
    const hashedPassword = await hashPassword(newPassword);
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));
    res.status(200).json({ data: null, message: 'Password reset successful' });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ data: null, message: 'Internal Server Error' });
  }
};
