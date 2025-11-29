"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/taskRoutes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const taskController_1 = require("../controllers/taskController");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.get("/", taskController_1.getTasks);
router.post("/", taskController_1.createTask);
router.put("/:id", auth_1.protect, taskController_1.updateTask);
router.delete("/:id", auth_1.adminOnly, taskController_1.deleteTask);
exports.default = router;
