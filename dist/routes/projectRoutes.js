"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const projectController_1 = require("../controllers/projectController");
const router = (0, express_1.Router)();
router.use(auth_1.protect); // Login required for all
router.get("/", projectController_1.getAllProjects);
router.get("/:id", projectController_1.getProjectById);
router.post("/", auth_1.adminOnly, projectController_1.createProject);
router.put("/:id", auth_1.adminOnly, projectController_1.updateProject);
router.delete("/:id", auth_1.adminOnly, projectController_1.deleteProject);
exports.default = router;
