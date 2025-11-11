import client from '../config/googleClient.js';
import { config } from '../config/secret.js';
import { googleLoginS, loginUserS, registerUserS } from '../services/loginService.js';

export async function loginUser(userData) {
    const { email, password } = userData;
    return await loginUserS(email, password);
}

export async function registerUser(userData) {
    const { firstName, lastName, email, password, birthdate } = userData;
    return await registerUserS(firstName, lastName, email, password, birthdate);
}

export async function googleLogin(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: config.GOOGLE_CLIENT_ID,
    });

    return await googleLoginS(ticket);
}
