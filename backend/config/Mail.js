import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (to, otp) => {
  await transporter.sendMail({
    from: `${process.env.EMAIL}`,
    to: to,
    subject: "Vybe - Reset Password",
    html: `<h1>Reset Your Password</h1>
        <p>Use the following OTP to reset your password: <strong>${otp}</strong></p>
        <p>Note: This OTP is valid for 5 minutes.</p>`,
  });
};

export default sendMail;
