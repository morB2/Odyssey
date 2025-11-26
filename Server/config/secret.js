import dotenv from 'dotenv';
dotenv.config();

export const config = {
  frontendUrl: process.env.FRONTEND_URL,
  dbConnection: process.env.DB_CONNECTION,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  saltRounds: Number(process.env.SALT_ROUNDS) || 12,
  gmailAppPass: process.env.GMAIL_APP_PASS,
  gmailUser: process.env.GMAIL_USER,
  appName: process.env.APP_NAME || 'MyApp',
};