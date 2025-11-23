import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRoute';
import helmet from 'helmet';
import { deregisterService, registerService } from './consul';
const app = express();

registerService().catch((err) => {
  console.error('Error registering service with Consul:', err);
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.send('Server is healthy');
});

app.use('/api/user', authRouter);

process.on('SIGTERM', async () => {
  await deregisterService();
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});
export default app;
export { app };
