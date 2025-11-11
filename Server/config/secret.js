import dotenv from 'dotenv';
dotenv.config();

export const config = {
  dbConnection: process.env.DB_CONNECTION,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  saltRounds: Number(process.env.SALT_ROUNDS) || 12
};
