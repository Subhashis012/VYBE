import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://vybe-4jbw.onrender.com"],
    methods: ["GET", "POST"],
  },
});

const useSocketMap = {};

export const getSocketId = (receiverId) => {
  return useSocketMap[receiverId];
}

io.on("connection", (socket)=> {
  const userId = socket.handshake.query.userId
  if(userId!== undefined) {
    useSocketMap[userId] = socket.id
  }

  io.emit('getOnlineUsers', Object.keys(useSocketMap))

  socket.on("disconnect", ()=> {
    delete useSocketMap[userId]
    io.emit('getOnlineUsers', Object.keys(useSocketMap))
  })
})

export { app, io, server };
