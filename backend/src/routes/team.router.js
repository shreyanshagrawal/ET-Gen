import express from "express";
import { getAllTeams, getTeamById, createTeam, addMemberToTeam, removeMemberFromTeam } from "../controllers/team.controller.js";
import { verifyJWT, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(verifyJWT);

router.get("/", getAllTeams);
router.get("/:teamId", getTeamById);
router.post("/", requireAdmin, createTeam);
router.post("/:teamId/members", requireAdmin, addMemberToTeam);
router.delete("/:teamId/members/:userId", requireAdmin, removeMemberFromTeam);

export default router;
