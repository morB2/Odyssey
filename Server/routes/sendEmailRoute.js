import express from "express";
import { sendEmail } from "../services/sendEmailService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  await sendEmail("Mh3182100@gmail.com", "בדיקה", "היי! זה מייל ניסיון מהשרת 😊");
  res.send("המייל נשלח!");
});


export default router;
