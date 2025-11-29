import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes";
import dotenv from "dotenv";
import teamRoutes from "./routes/teamRoutes";
import userRoutes from "./routes/userRoutes";
import messageRoutes from "./routes/messageRoutes";
import { initializeSocket } from "./socket/io";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",  
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
 
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";

app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// Initialize Socket.IO
initializeSocket(io);

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
