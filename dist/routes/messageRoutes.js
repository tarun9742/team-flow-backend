"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messageController_1 = require("../controllers/messageController");
const auth_1 = require("../middleware/auth"); // your existing middleware
const router = express_1.default.Router();
router.get("/team/:teamId", auth_1.protect, auth_1.sameTeamOnly, messageController_1.getTeamMessages);
router.post("/team/:teamId/message", auth_1.protect, auth_1.sameTeamOnly, messageController_1.sendMessage);
exports.default = router;
