import env from '../env.ts';
import app from './server';

app.listen(env.PORT, () => {
  console.log('Server is running on port', env.PORT);
});
