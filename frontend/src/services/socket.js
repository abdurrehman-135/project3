import { io } from "socket.io-client";

let socket;

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const connectSocket = (token) => {
  if (!token) {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(socketUrl, {
    transports: ["websocket"],
    auth: {
      token,
    },
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

