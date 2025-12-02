import express from "express";
import { forgotPassword } from "../services/sendEmailService.js";

const router = express.Router();

router.post("/forgotPassword", async (req, res) => {
  try {
    const { email, lang } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const result = await forgotPassword(email, lang);
    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
