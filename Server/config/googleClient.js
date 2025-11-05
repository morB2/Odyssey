import dotenv from 'dotenv';
import { config } from './config/secret.js';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

export default client;
