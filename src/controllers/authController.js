import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { createToken } from "../utils/token.js";

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});
const emailIsValid = (email) => /^\S+@\S+\.\S+$/.test(email);
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
};
const authenticate = (res, user, status = 200) => {
  res.cookie("prepflow_token", createToken(user._id.toString()), cookieOptions);
  return res
    .status(status)
    .json({ success: true, data: { user: serializeUser(user) } });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (
      !name?.trim() ||
      !emailIsValid(email || "") ||
      !password ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Provide a name, valid email, and password of at least 8 characters",
      });
    }
    if (await User.exists({ email: email.toLowerCase() }))
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 12),
    });
    return authenticate(res, user, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    return authenticate(res, user);
  } catch (error) {
    next(error);
  }
};

export const getMe = (req, res) =>
  res.json({ success: true, data: { user: serializeUser(req.user) } });

export const logout = (_req, res) => {
  res.clearCookie("prepflow_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res.json({ success: true, data: {} });
};
