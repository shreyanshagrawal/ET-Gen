import { asyncHandler } from "../middleware/AsyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Task } from "../models/taskModel.js";
import { Submission } from "../models/submissionModel.js";
import { Notification } from "../models/notificationModel.js";
import { User } from "../models/userModel.js";
import { Project } from "../models/projectModel.js";

// POST /api/v1/tasks/:taskId/submit
export const submitWork = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { content, repoLink } = req.body;
  const userId = req.user._id;

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  // Check task assignment
  if (task.assignedTo?.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not assigned to this task");
  }

  // Find existing submissions to track version
  const existingCount = await Submission.countDocuments({ taskId, userId });

  const submission = await Submission.create({
    taskId,
    userId,
    content,
    repoLink,
    version: existingCount + 1,
    status: "submitted"
  });

  // Update task status
  task.status = "review";
  await task.save();

  return res.status(201).json(new ApiResponse(201, submission, "Work submitted successfully"));
});

// GET /api/v1/tasks/:taskId/submissions
export const getTaskSubmissions = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const submissions = await Submission.find({ taskId })
    .populate("userId", "username email")
    .sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, submissions, "Submissions fetched"));
});

// GET /api/v1/users/me/tasks
export const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user._id })
    .populate("projectID", "title status")
    .populate("milestoneID", "title")
    .sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched"));
});

// GET /api/v1/projects/:projectId/tasks
export const getProjectTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const tasks = await Task.find({ projectID: projectId })
    .populate("assignedTo", "username email")
    .populate("milestoneID", "title");
  return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched"));
});

// PATCH /api/v1/tasks/:taskId/status
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  const allowed = ["pending", "in-progress", "review", "completed"];
  if (!allowed.includes(status)) throw new ApiError(400, "Invalid status");

  const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true });
  if (!task) throw new ApiError(404, "Task not found");

  return res.status(200).json(new ApiResponse(200, task, "Status updated"));
});

// GET /api/v1/projects/:projectId/leaderboard
export const getLeaderboard = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const tasks = await Task.find({ projectID: projectId, assignedTo: { $ne: null } })
    .populate("assignedTo", "username email");

  const scoreMap = {};
  for (const task of tasks) {
    const uid = task.assignedTo?._id?.toString();
    if (!uid) continue;
    if (!scoreMap[uid]) {
      scoreMap[uid] = {
        user: task.assignedTo,
        totalScore: 0,
        taskCount: 0,
        completedCount: 0
      };
    }
    scoreMap[uid].taskCount++;
    scoreMap[uid].totalScore += task.aiScore || 0;
    if (task.status === "completed") scoreMap[uid].completedCount++;
  }

  const leaderboard = Object.values(scoreMap)
    .map(entry => ({
      ...entry,
      avgScore: entry.taskCount ? Math.round(entry.totalScore / entry.taskCount) : 0
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  return res.status(200).json(new ApiResponse(200, leaderboard, "Leaderboard fetched"));
});

// GET /api/v1/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched"));
});

// PATCH /api/v1/notifications/read-all
export const markNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  return res.status(200).json(new ApiResponse(200, {}, "Notifications marked as read"));
});
