import { Router } from 'express';
import {
  getUserProfile,
  loginUser,
  signUpUser,
} from '../controller/authController';

const router = Router();

router.post('/signup', signUpUser);
router.get('/login', loginUser);
router.get('/profile/:id', getUserProfile);

export default router;
