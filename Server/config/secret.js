import dotenv from 'dotenv';
dotenv.config();

export const config = {
  dbConnection: process.env.DB_CONNECTION,
};
