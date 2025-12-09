import express from 'express';
import rateLimit from 'express-rate-limit';
import { googleLogin, loginUser, registerUser, resetPassword } from '../controller/loginController.js';

const router = express.Router();

// Rate limiter for authentication endpoints - 5 attempts per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again in 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/login', authLimiter, async (req, res, next) => {
    try {
        const result = await loginUser(req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/register', authLimiter, async (req, res, next) => {
    try {
        const result = await registerUser(req.body);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/google', async (req, res, next) => {
    try {
        const { token } = req.body;
        const result = await googleLogin(token);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/resetPassword', authLimiter, async (req, res, next) => {
    try {
        const result = await resetPassword(req.body);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}
);

export default router;
