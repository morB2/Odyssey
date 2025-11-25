import usersModel from '../models/userModel.js';
import { config } from '../config/secret.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const SECRET_KEY = config.jwtSecret;
const SALT_ROUNDS = config.saltRounds;


function generateToken(user) {
    return jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: '10h' }
    );
}

export async function loginUserS(email, password) {
    const user = await usersModel.findOne({ email });
    console.log("user", user)
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new Error('Invalid password');
        error.status = 401;
        throw error;
    }

    const token = generateToken(user);

    const userToReturn = user.toObject();
    delete userToReturn.password;
    console.log("userToReturn", userToReturn)
    return { success: true, user: userToReturn, token };
};

export async function registerUserS(firstName, lastName, email, password, birthdate) {
    const existingUser = await usersModel.findOne({ email });

    if (existingUser) {
        console.log("existingUser", existingUser)
        if (existingUser.googleId && !existingUser.password) {
            existingUser.password = await bcrypt.hash(password, SALT_ROUNDS);
            await existingUser.save();
            return { success: true, user: existingUser, token: generateToken(existingUser) };
        } else {
            const error = new Error('User already exists');
            error.status = 409;
            throw error;
        }
    }

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