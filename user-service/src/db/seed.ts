import db from './connection.ts';
import { users } from './schema.ts';

const seed = async () => {
  console.log('🌱 Starting Database seed...');
  try {
    console.log('Clearning exixting data...');
    await db.delete(users);
    console.log('Creating demo users');
    const [demoUser] = await db
      .insert(users)
      .values({
        email: 'demo@app.com',
        password: 'Test@123',
        firstName: 'demo',
        lastName: 'demo',
        username: 'demo',
      })
      .returning();

    console.log('🌱 DB seeded successfully');
    console.log(
      'User Credentials',
      demoUser?.email,
      demoUser?.firstName,
      demoUser?.username,
    );
  } catch (error) {
    console.log('❌[log]error:', error);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => process.exit(1));
}

export default seed;
