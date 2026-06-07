import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'green_energy_secret_key_2025';
const JWT_EXPIRES_IN = '7d';

export function signToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
