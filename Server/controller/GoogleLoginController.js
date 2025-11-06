import client from '../config/googleClient.js';
import { config } from '../config/secret.js';
import { googleLoginS } from '../services/googleLoginService.js';


export async function googleLogin(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: config.GOOGLE_CLIENT_ID,
  });

  return await googleLoginS(ticket);
}
