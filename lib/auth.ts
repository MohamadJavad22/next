import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// ساخت توکن با اعتبار 7 روز
export function createToken(userId: number, username: string) {
  return jwt.sign(
    { userId, username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// تایید توکن
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// hash کردن رمز عبور
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// مقایسه رمز عبور
export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

