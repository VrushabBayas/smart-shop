import { Router } from 'express';
import {
  getUserProfile,
  loginUser,
  passwordReset,
  refreshAccessToken,
  signUpUser,
} from '../controller/authController';
import {
  validateBody,
  validateQueryParameters,
} from '../middleware/validation';
import { insertUserSchema, selectUserSchema } from '../db/schema';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/signup', validateBody(insertUserSchema), signUpUser);
router.post('/refresh', refreshAccessToken);

router.post('/login', loginUser);
router.use(authenticateToken);
router.get(
  '/profile',
  validateQueryParameters(selectUserSchema),
  getUserProfile,
);
router.post('/reset-password', passwordReset);

export default router;
