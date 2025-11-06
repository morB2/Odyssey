import dotenv from 'dotenv';
import { config } from './secret.js';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const client = new OAuth2Client(config.googleClientId);

export default client;
