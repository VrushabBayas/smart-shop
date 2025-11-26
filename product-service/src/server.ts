import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('dev', {
    skip: () => process.env.NODE_ENV === 'test',
  }),
);

app.get('/health', (req, res) => {
  res.json({ data: { message: 'Server is healthy' } });
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

export default app;
export { app };
