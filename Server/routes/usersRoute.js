import express from 'express';
import { googleLogin, loginUser, registerUser } from '../controller/loginController.js';

const router = express.Router();

router.post('/login', async (req, res, next) => {
    try {
        const result = await loginUser(req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/register', async (req, res, next) => {
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

export default router;