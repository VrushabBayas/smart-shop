import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRoute';
import helmet from 'helmet';
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.send('Server is healthy');
});

app.use('/api/user', authRouter);

export default app;
export { app };
