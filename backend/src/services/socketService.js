import jwt from "jsonwebtoken";

import User from "../models/User.js";

let ioInstance;

const toRoomUserId = (value) => {
  if (!value) {
    return null;
  }

  if (value._id) {
    return value._id.toString();
  }

  return value.toString();
};

export const initializeSocket = (io) => {
  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        next(new Error("Authentication error"));
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("_id name email");

      if (!user) {
        next(new Error("Authentication error"));
        return;
      }

      socket.user = user;
      next();
    } catch (_error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user._id}`);

    socket.on("disconnect", () => {
      socket.leave(`user:${socket.user._id}`);
    });
  });
};

export const getIo = () => ioInstance;

export const emitToUsers = (userIds = [], event, payload) => {
  if (!ioInstance) {
    return;
  }

  const uniqueIds = [...new Set(userIds.map(toRoomUserId).filter(Boolean))];

  uniqueIds.forEach((userId) => {
    ioInstance.to(`user:${userId}`).emit(event, payload);
  });
};
