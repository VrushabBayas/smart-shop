import { Router } from 'express';
import { signUpUser } from '../controller/authController';

const router = Router();

router.post('/login', signUpUser);

export default router;
