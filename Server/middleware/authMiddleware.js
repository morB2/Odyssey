import jwt from 'jsonwebtoken';
import { config } from '../config/secret.js';

const SECRET_KEY = config.jwtSecret;

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1]; 
  if (!token) return res.status(401).json({ message: 'Invalid token format' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; 
    next(); 
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}
