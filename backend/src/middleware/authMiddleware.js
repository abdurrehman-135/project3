import jwt from "jsonwebtoken";

import User from "../models/User.js";

export const protect = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Not authorized.");
    error.statusCode = 401;
    next(error);
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      const error = new Error("User no longer exists.");
      error.statusCode = 401;
      next(error);
      return;
    }

    req.user = user;
    next();
  } catch (_error) {
    const error = new Error("Token is invalid.");
    error.statusCode = 401;
    next(error);
  }
};

