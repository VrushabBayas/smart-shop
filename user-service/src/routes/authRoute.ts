import { Router } from 'express';
import {
  getUserProfile,
  loginUser,
  passwordReset,
  refreshAccessToken,
  signUpUser,
} from '../controller/authController';
import { validateBody } from '../middleware/validation';
import { insertUserSchema } from '../db/schema';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/signup', validateBody(insertUserSchema), signUpUser);
router.post('/refresh', refreshAccessToken);

router.post('/login', loginUser);
router.use(authenticateToken);
router.get('/profile', getUserProfile);
router.post('/reset-password', passwordReset);

export default router;
