import jwt from 'jsonwebtoken';

type Payload = {
  id: string;
  organizationId: string;
  role: 'EMPLOYEE' | 'ASSESSOR' | 'HR';
};

export function signToken(payload: Payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  return jwt.sign(payload, secret, { expiresIn: '12h' });
}

export function verifyToken(token: string): Payload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  return jwt.verify(token, secret) as Payload;
}