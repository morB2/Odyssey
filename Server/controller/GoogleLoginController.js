import { googleLogin } from '../services/googleLoginService.js';
import client from '../config/googleClient.js';
import { config } from './config/secret.js';


export async function googleLogin(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: config.GOOGLE_CLIENT_ID,
  });

  return await googleLogin(ticket);
}
