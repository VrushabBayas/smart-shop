import { Router } from 'express';
import { loginUser, signUpUser } from '../controller/authController';

const router = Router();

router.post('/signup', signUpUser);
router.get('/login', loginUser);

export default router;
