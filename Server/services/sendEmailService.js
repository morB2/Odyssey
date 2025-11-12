import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Outlook",
  auth: {
    user: "odyssey.no-reply@outlook.com",
    pass: "rmtuqercmedlxixo",
  },
});

export async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: "odyssey.no-reply@outlook.com",
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
