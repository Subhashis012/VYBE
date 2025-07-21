import sendMail from "../config/Mail.js";
import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
  try {
    const { name, email, password, userName } = req.body;
    const finByEmail = await User.findOne({ email });
    if (finByEmail) {
      return res.status(400).json({ message: "Email already exists !" });
    }
    const finByUserName = await User.findOne({ userName });
    if (finByUserName) {
      return res.status(400).json({ message: "Username already exists !" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long !" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      userName,
      email,
      password: hashedPassword,
    });

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
      secure: true,
      sameSite: "None",
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: `Signup error ${error}` });
  }
};

export const signIn = async (req, res) => {
  try {
    const { password, userName } = req.body;

    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(400).json({ message: "User not found !" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials !" });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
      secure: true,
      sameSite: "None",
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: `Signin error ${error}` });
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");

    return res.status(200).json({ message: "Signout successful" });
  } catch (error) {
    return res.status(500).json({ message: `Signout error ${error}` });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found !" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
    user.isOtpVerified = false;

    await user.save();
    await sendMail(email, otp);

    return res.status(200).json({ message: "OTP sent to your email!" });
  } catch (error) {
    return res.status(500).json({ message: `Send OTP error ${error}` });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invaliid Or Expired Otp !" });
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({ message: "OTP verified successfully !" });
  } catch (error) {
    return res.status(500).json({ message: `Verify OTP error ${error}` });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "Otp Verification Required !"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false; // Reset OTP verification status

    await user.save();

    return res.status(200).json({ message: "Password reset successfully !" });
  } catch (error) {
    return res.status(500).json({ message: `Reset Password error ${error}` });
  }
};
