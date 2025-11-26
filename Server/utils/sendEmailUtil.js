import nodemailer from "nodemailer";
import { config } from "../config/secret.js";

export const sendEmail = async ({
  to,
  subject,
  title,
  message,
  buttonText,
  buttonLink,
  footer
}) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.gmailUser,
        pass: config.gmailAppPass,
      },
    });

    const html = `
      <div style="font-family: Arial; padding: 20px; line-height: 1.6; direction: rtl; text-align: right;">
        <h2>${title}</h2>
        <p>${message}</p>

        ${buttonLink ? `<a href="${buttonLink}" style="display:inline-block; padding:12px 20px; background:#4A90E2; color:#fff; text-decoration:none; border-radius:5px; margin-top:12px;">${buttonText}</a>` : ''}

        <p style="margin-top:20px; font-size:14px; color:#777;">
          ${footer || ""}
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${config.appName}" <${config.gmailUser}>`,
      to,
      subject,
      html
    });

  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Failed to send email");
  }
};
