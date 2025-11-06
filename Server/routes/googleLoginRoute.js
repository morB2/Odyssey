import express from 'express';
import { googleLogin } from '../controller/googleLoginController.js';

const router = express.Router();

router.post("/google", async (req, res) => {
    console.log("Google login attempt");
    try {
        const { token } = req.body;
        const result = await googleLogin(token);
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Google login failed" });
    }
});

export default router;
