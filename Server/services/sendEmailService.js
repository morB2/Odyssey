import { sendEmail } from "../utils/sendEmailUtil.js";
import User from "../models/userModel.js";
import crypto from "crypto";
import { config } from "../config/secret.js";

export const forgotPassword = async (email, lang) => {
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error(lang === "he" ? "משתמש לא נמצא" : "User not found");

    const token = crypto.randomBytes(32).toString("hex");

    // שמירת הטוקן בבסיס הנתונים
    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 1000 * 60 * 60; // שעה
    await user.save();

    const resetLink = `${config.frontendUrl}/resetPassword?token=${token}&id=${user._id}`;

    // תוכן מייל דינמי לפי שפה
    const content = lang === "he"
      ? {
        subject: "שחזור סיסמה",
        title: "בקשת שחזור סיסמה",
        message: `היי ${user.firstName}, התקבלה בקשה לשחזור סיסמה לחשבון שלך.`,
        buttonText: "שינוי סיסמה",
        footer: "הקישור תקף לשעה. אם לא ביקשת שחזור — ניתן להתעלם מההודעה."
      }
      : {
        subject: "Password Reset Request",
        title: "Password Reset Request",
        message: `Hi ${user.firstName}, we received a request to reset your password.`,
        buttonText: "Reset Password",
        footer: "The link is valid for 1 hour. If you didn't request it, ignore this email."
      };

    await sendEmail({ ...content, to: user.email, buttonLink: resetLink });

    return { message: lang === "he" ? "המייל נשלח!" : "Email sent!" };

  } catch (err) {
    console.error("Forgot password error:", err);
    throw err;
  }
};
