import express from "express";
import {
  submitWork, getTaskSubmissions, getMyTasks,
  getProjectTasks, updateTaskStatus, getLeaderboard,
  getNotifications, markNotificationsRead
} from "../controllers/task.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(verifyJWT);

// Task routes
router.get("/my-tasks", getMyTasks);
router.post("/:taskId/submit", submitWork);
router.get("/:taskId/submissions", getTaskSubmissions);
router.patch("/:taskId/status", updateTaskStatus);

// Project-level task routes
router.get("/project/:projectId", getProjectTasks);
router.get("/project/:projectId/leaderboard", getLeaderboard);

// Notifications
router.get("/notifications", getNotifications);
router.patch("/notifications/read-all", markNotificationsRead);

export default router;
