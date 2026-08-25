import { Server } from "socket.io";
import { createServer } from "http";
import type { Express } from "express";

export const createSocketServer = (app: Express) => {
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: { origin: "http://localhost:5173" }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("disconnect", () => console.log("User disconnected:", socket.id));
  });

  return { httpServer, io };
};