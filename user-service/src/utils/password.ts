import bcrypt from 'bcryptjs';
export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};
