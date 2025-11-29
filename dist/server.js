"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const io_1 = require("./socket/io");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
app.use("/api/projects", projectRoutes_1.default);
app.use("/api/tasks", taskRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/teams", teamRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/messages", messageRoutes_1.default);
// Initialize Socket.IO
(0, io_1.initializeSocket)(io);
mongoose_1.default.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
