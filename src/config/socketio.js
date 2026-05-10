import { Server } from "socket.io";

let io = null;
const userSockets = new Map();

export const initializeSocket = (server, options = {}) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(",") || "*",
      credentials: true,
    },
    ...options,
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("authenticate", (userId) => {
      userSockets.set(userId, socket.id);
      console.log(`User ${userId} authenticated with socket ${socket.id}`);
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};

export const getIO = () => io;

export const getUserSocket = (userId) => {
  return userSockets.get(userId);
};

export const emitToUser = (userId, event, data) => {
  const socketId = userSockets.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
};

export const emitToUsers = (userIds, event, data) => {
  if (!io) return false;
  userIds.forEach((userId) => {
    const socketId = userSockets.get(userId);
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  });
  return true;
};

export const emitToBothUsers = (user1Id, user2Id, event, data) => {
  if (!io) return false;
  const socket1Id = userSockets.get(user1Id);
  const socket2Id = userSockets.get(user2Id);

  if (socket1Id) {
    io.to(socket1Id).emit(event, data);
  }
  if (socket2Id) {
    io.to(socket2Id).emit(event, data);
  }
  return socket1Id || socket2Id;
};
