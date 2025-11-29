"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    timestamp: { type: Date, default: Date.now },
});
exports.default = mongoose.model("Message", messageSchema);
