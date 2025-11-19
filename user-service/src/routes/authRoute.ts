import { Router } from 'express';
import {
  getUserProfile,
  loginUser,
  signUpUser,
} from '../controller/authController';
import { validateBody } from '../middleware/validation';
import { insertUserSchema } from '../db/schema';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/signup', validateBody(insertUserSchema), signUpUser);

router.use(authenticateToken);

router.post('/login', loginUser);
router.get('/profile', getUserProfile);

export default router;
