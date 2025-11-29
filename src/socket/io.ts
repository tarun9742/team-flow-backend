import { Server, Socket } from "socket.io";
import { verifyFirebaseToken } from "../config/firebase";
import Message from "../models/Message";
import User from "../models/User";
import Team from "../models/Team";

interface SocketUser {
  uid: string;
  email: string;
  name: string;
  teamId: string | null;
}

export const initializeSocket = (io: Server) => {
  io.use(async (socket: any, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers["authorization"]?.split(" ")?.[1];

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = await verifyFirebaseToken(token);
      const userRecord = await User.findOne({ email: decoded.email });

      if (!userRecord) {
        return next(new Error("User not found in database"));
      }

      socket.user = {
        uid: decoded.uid,
        email: decoded.email!,
        name: userRecord.name,
        teamId: userRecord.teamId?.toString() || null,
      };

      next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket: any) => {
    const user = socket.user!;
    console.log(`User connected: ${user.name} (${user.email})`);

    if (user.teamId) {
      socket.join(user.teamId);
      console.log(`${user.name} joined team room: ${user.teamId}`);
    }

    socket.on("sendMessage", async (data: { content: string; teamId: string }) => {
      if (!data.teamId) {
        return socket.emit("error", "Team ID is required");
      }

      //  admin and manager can send to any team
      const userRecord = await User.findOne({ email: user.email });
      if (!userRecord) {
        return socket.emit("error", "User not found");
      }

      if (userRecord.role !== "ADMIN" && userRecord.role !== "MANAGER") { 
        const team = await Team.findOne({
          _id: data.teamId,
          $or: [{ adminId: userRecord._id }, { memberIds: userRecord._id }],
        });
        if (!team) {
          return socket.emit("error", "You do not have permission to send messages to this team");
        }
      }

      const message = await Message.create({
        content: data.content,
        senderId: userRecord._id,
        teamId: data.teamId,
        timestamp: new Date(),
      });

      await message.populate("senderId", "name email");
 
      socket.join(data.teamId);

      io.to(data.teamId).emit("newMessage", {
        _id: message._id,
        content: message.content,
        senderId: message.senderId._id,
        senderName: (message.senderId as any).name,
        senderEmail: (message.senderId as any).email,
        teamId: message.teamId,
        timestamp: message.timestamp,
      });
    });

    socket.on("disconnect", () => {
      console.log(`${user.name} disconnected`);
    });
  });
};