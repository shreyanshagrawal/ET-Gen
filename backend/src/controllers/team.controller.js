import { asyncHandler } from "../middleware/AsyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Team } from "../models/teamModel.js";
import { User } from "../models/userModel.js";
import { Notification } from "../models/notificationModel.js";

// GET /api/v1/teams
export const getAllTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find()
    .populate("managerId", "username email")
    .populate("members", "username email role skills");
  return res.status(200).json(new ApiResponse(200, teams, "Teams fetched"));
});

// GET /api/v1/teams/:teamId
export const getTeamById = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const team = await Team.findById(teamId)
    .populate("managerId", "username email role")
    .populate("members", "username email role skills performanceScore");
  if (!team) throw new ApiError(404, "Team not found");
  return res.status(200).json(new ApiResponse(200, team, "Team fetched"));
});

// POST /api/v1/teams
export const createTeam = asyncHandler(async (req, res) => {
  const { name, description, managerId } = req.body;
  if (!name || !managerId) throw new ApiError(400, "Name and Manager ID required");

  const manager = await User.findById(managerId);
  if (!manager) throw new ApiError(404, "Manager user not found");

  // Update manager role
  manager.role = "manager";
  await manager.save();

  const team = await Team.create({ name, description, managerId, members: [managerId] });

  // Update manager's teamId
  manager.teamId = team._id;
  await manager.save();

  return res.status(201).json(new ApiResponse(201, team, "Team created successfully"));
});

// POST /api/v1/teams/:teamId/members
export const addMemberToTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { userId } = req.body;
  if (!userId) throw new ApiError(400, "User ID required");

  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(404, "Team not found");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (team.members.includes(userId)) throw new ApiError(400, "User already in team");

  team.members.push(userId);
  await team.save();

  user.teamId = teamId;
  await user.save();

  await Notification.create({
    userId,
    message: `You have been added to team: ${team.name}`,
    type: "general",
  });

  return res.status(200).json(new ApiResponse(200, team, "Member added to team"));
});

// DELETE /api/v1/teams/:teamId/members/:userId
export const removeMemberFromTeam = asyncHandler(async (req, res) => {
  const { teamId, userId } = req.params;

  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(404, "Team not found");

  team.members = team.members.filter(m => m.toString() !== userId);
  await team.save();

  await User.findByIdAndUpdate(userId, { teamId: null });

  return res.status(200).json(new ApiResponse(200, {}, "Member removed from team"));
});
