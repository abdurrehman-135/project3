import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";

const buildAuthPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  title: user.title,
});

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, title } = req.body;

  if (!name || !email || !password) {
    const error = new Error("Name, email, and password are required.");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("An account with that email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "manager",
    title: title || "Workspace Lead",
  });

  res.status(201).json({
    token: generateToken(user._id),
    user: buildAuthPayload(user),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Email and password are required.");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  res.json({
    token: generateToken(user._id),
    user: buildAuthPayload(user),
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    user: buildAuthPayload(req.user),
  });
});

