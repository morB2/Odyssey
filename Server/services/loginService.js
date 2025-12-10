import usersModel from '../models/userModel.js';
import { config } from '../config/secret.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const SECRET_KEY = config.jwtSecret;
const SALT_ROUNDS = config.saltRounds;

/**
 * Validate password complexity
 * Requires at least 8 characters and 3 of the following:
 * - Uppercase letters
 * - Lowercase letters  
 * - Numbers
 * - Special characters
 */
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        const error = new Error('Password must be at least 8 characters long');
        error.status = 400;
        throw error;
    }

    const complexityCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
        .filter(Boolean).length;

    if (complexityCount < 3) {
        const error = new Error('Password must contain at least 3 of: uppercase letters, lowercase letters, numbers, special characters');
        error.status = 400;
        throw error;
    }

    return true;
}

function generateToken(user) {
    return jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: '10h' }
    );
}

export async function loginUserS(email, password) {
    const user = await usersModel.findOne({ email });

    // Use same error message for both cases to prevent email enumeration
    if (!user || !(await bcrypt.compare(password, user.password || ''))) {
        // Add small artificial delay to prevent timing attacks
        await new Promise(resolve => setTimeout(resolve, 100));

        const error = new Error('Invalid email or password');
        error.status = 401;
        throw error;
    }

    if (user.status === false) {
        const error = new Error('Account deactivated. Please contact support.');
        error.status = 403;
        throw error;
    }

    const token = generateToken(user);

    const userToReturn = user.toObject();
    delete userToReturn.password;

    return { success: true, user: userToReturn, token };
};

export async function registerUserS(firstName, lastName, email, password, birthdate) {
    const existingUser = await usersModel.findOne({ email });

    if (existingUser) {
        if (existingUser.googleId && !existingUser.password) {
            // Validate password complexity before hashing
            validatePassword(password);

            existingUser.password = await bcrypt.hash(password, SALT_ROUNDS);
            await existingUser.save();
            return { success: true, user: existingUser, token: generateToken(existingUser) };
        } else {
            const error = new Error('User already exists');
            error.status = 409;
            throw error;
        }
    }

    // ✅ Validate password complexity before hashing
    validatePassword(password);

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = new usersModel({ firstName, lastName, email, password: hashedPassword, birthdate });
    await newUser.save();

    const token = generateToken(newUser);

    const userToReturn = newUser.toObject();
    delete userToReturn.password;

    return { success: true, user: userToReturn, token };
}

export async function googleLoginS(ticket) {
    const payload = ticket.getPayload();
    if (!payload) {
        const error = new Error("Invalid Google payload");
        error.status = 400;
        throw error;
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = await usersModel.findOne({ email });

    if (user) {
        if (user.status === false) {
            const error = new Error('Account deactivated. Please contact support.');
            error.status = 403;
            throw error;
        }

        if (!user.googleId) {
            user.googleId = googleId;
            user.avatar = picture;
            await user.save();
        }
    } else {
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

    const token = generateToken(user);

    const userToReturn = user.toObject();
    delete userToReturn.password;

    return { success: true, user: userToReturn, token };
}

export async function resetPasswordS(id, token, newPassword) {
    const user = await usersModel.findOne({
        _id: id,
        resetToken: token,
        resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
        const error = new Error("Invalid or expired token");
        error.status = 400;
        throw error;
    }

    // ✅ Validate new password complexity
    validatePassword(newPassword);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, config.saltRounds);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpire = null;
    await user.save();

    const userToReturn = user.toObject();
    delete userToReturn.password;

    return { success: true, message: "Password updated successfully", user: userToReturn };
}