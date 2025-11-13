import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  const { username = 'user', password = 'pass' } = req.body || {};
  // Dummy authentication logic
  if (username === 'user' && password === 'pass') {
    res.send('Login Successful');
  } else {
    res.status(401).send('Invalid Credentials');
  }
});

router.get('/check', (req, res) => {
  // Dummy check logic
  res.send('User is authenticated');
});

export default router;
