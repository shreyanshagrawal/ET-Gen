import { asyncHandler } from "../middleware/AsyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/userModel.js";
import { Team } from "../models/teamModel.js";
import { Task } from "../models/taskModel.js";
import { Submission } from "../models/submissionModel.js";
import { ProjectMember } from "../models/projectMemberModel.js";
import { Project } from "../models/projectModel.js";

// GET /api/v1/users/profile
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password -refreshToken")
    .populate("teamId", "name description");

  if (!user) throw new ApiError(404, "User not found");
  return res.status(200).json(new ApiResponse(200, user, "Profile fetched"));
});

// PATCH /api/v1/users/profile
export const updateMyProfile = asyncHandler(async (req, res) => {
  const { skills, username } = req.body;

  const updateData = {};
  if (skills !== undefined) {
    // Accept comma-separated string or array
    updateData.skills = Array.isArray(skills)
      ? skills.map(s => s.trim()).filter(Boolean)
      : skills.split(",").map(s => s.trim()).filter(Boolean);
  }
  if (username) {
    const existing = await User.findOne({ username, _id: { $ne: req.user._id } });
    if (existing) throw new ApiError(400, "Username already taken");
    updateData.username = username;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true })
    .select("-password -refreshToken")
    .populate("teamId", "name description");

  return res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});

// GET /api/v1/users/my-team
export const getMyTeam = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // First try the teamId field on the user
  const userWithTeam = await User.findById(userId).select("teamId");
  let team = null;

  if (userWithTeam?.teamId) {
    team = await Team.findById(userWithTeam.teamId)
      .populate("managerId", "username email role skills")
      .populate("members", "username email role skills performanceScore");
  }

  // Fallback: search for a team where this user is in members[] 
  if (!team) {
    team = await Team.findOne({ members: userId })
      .populate("managerId", "username email role skills")
      .populate("members", "username email role skills performanceScore");

    // If found via fallback, update user's teamId for future calls
    if (team) {
      await User.findByIdAndUpdate(userId, { teamId: team._id });
    }
  }

  if (!team) {
    return res.status(200).json(new ApiResponse(200, null, "Not in a team"));
  }
  return res.status(200).json(new ApiResponse(200, team, "Team fetched"));
});

// GET /api/v1/users/:userId/progress  (admin only)
export const getUserProgress = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("-password -refreshToken")
    .populate("teamId", "name");
  if (!user) throw new ApiError(404, "User not found");

  // All tasks assigned to this user
  const tasks = await Task.find({ assignedTo: userId })
    .populate("projectID", "title status")
    .populate("milestoneID", "title")
    .sort({ createdAt: -1 });

  // All submissions by user
  const submissions = await Submission.find({ userId })
    .populate("taskId", "title projectID")
    .sort({ createdAt: -1 });

  // Group tasks by project
  const projectMap = {};
  for (const task of tasks) {
    const pid = task.projectID?._id?.toString();
    if (!pid) continue;
    if (!projectMap[pid]) {
      projectMap[pid] = {
        project: task.projectID,
        tasks: [],
        totalScore: 0,
        scoredCount: 0,
      };
    }
    projectMap[pid].tasks.push(task);
    if (task.aiScore != null) {
      projectMap[pid].totalScore += task.aiScore;
      projectMap[pid].scoredCount++;
    }
  }

  const projectProgress = Object.values(projectMap).map(entry => ({
    project: entry.project,
    tasks: entry.tasks,
    taskCount: entry.tasks.length,
    completedCount: entry.tasks.filter(t => t.status === "completed").length,
    inProgressCount: entry.tasks.filter(t => t.status === "in-progress").length,
    avgScore: entry.scoredCount ? Math.round(entry.totalScore / entry.scoredCount) : null,
  }));

  return res.status(200).json(new ApiResponse(200, {
    user,
    projectProgress,
    submissions: submissions.slice(0, 20),
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === "completed").length,
  }, "User progress fetched"));
});

// GET /api/v1/users/my-managed-teams  (manager: teams I manage)
export const getMyManagedTeams = asyncHandler(async (req, res) => {
  const managerId = req.user._id;

  const teams = await Team.find({ managerId })
    .populate("managerId", "username email role skills")
    .populate("members", "username email role skills performanceScore");

  return res.status(200).json(new ApiResponse(200, teams, "Managed teams fetched"));
});

// GET /api/v1/users/my-manager-projects  (manager: projects linked to my teams)
export const getManagerProjects = asyncHandler(async (req, res) => {
  const managerId = req.user._id;

  // Find all teams this user manages
  const teams = await Team.find({ managerId }).select("_id name");
  const teamIds = teams.map(t => t._id);

  if (teamIds.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No managed teams found"));
  }

  // Find all projects linked to those teams
  const projects = await Project.find({ teamId: { $in: teamIds } })
    .populate("teamId", "name")
    .populate("owner", "username email")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, projects, "Manager projects fetched"));
});
