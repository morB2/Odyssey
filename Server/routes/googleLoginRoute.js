const express = require('express');
const router = express.Router();
const controller = require('../controllers/GoogleLoginController')


router.post("/google", async (req, res) => {
    try {
        const { token } = req.body;
        const result = await controller.googleLoginSupplier(token)
        res.status(201).json(result) 

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Google login failed" });
    }
});

module.exports = router;
