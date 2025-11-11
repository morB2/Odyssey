import usersModel from '../models/userModel.js';
import { config } from '../config/secret.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = config.jwtSecret;

export async function loginUserS(email) {
    const user = await usersModel.findOne({ email });
    console.log("user", user)
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: '1h' }
    );

    return { success: true, user, token }; 
};

export async function registerUserS(firstName, lastName, email, password, birthdate) {
    const existingUser = await usersModel.findOne({ email });
    if (existingUser) {
        const error = new Error('User already exists');
        error.status = 409;
        throw error;
    }
    const newUser = new usersModel({ firstName, lastName, email, password, birthdate });
    await newUser.save();

    const token = jwt.sign(
        { userId: newUser._id, email: newUser.email, role: newUser.role },
        SECRET_KEY,
        { expiresIn: '1h' }
    );

    return { success: true, user: newUser, token };
}

export async function googleLoginS(ticket) {
    const payload = ticket.getPayload();
    if (!payload) {
        const error = new Error("Invalid Google payload");
        error.status = 400;
        throw error;
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = await usersModel.findOne({ $or: [{ email }, { googleId }] });

    if (!user) {
        const nameParts = name ? name.split(' ') : [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        user = new usersModel({
            firstName,
            lastName,
            email,
            googleId,
            avatar: picture,
            role: 'user',
        });

        await user.save();

    }

        const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: '1h' } 
    );

    return { success: true, user, token };
}
