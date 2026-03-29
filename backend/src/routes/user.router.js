import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  getMyTeam,
  getUserProgress,
  getMyManagedTeams,
  getManagerProjects,
} from "../controllers/user.controller.js";
import { verifyJWT, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(verifyJWT);

// Own profile
router.get("/profile", getMyProfile);
router.patch("/profile", updateMyProfile);

// My team (member view)
router.get("/my-team", getMyTeam);

// Manager: teams I manage
router.get("/my-managed-teams", getMyManagedTeams);

// Manager: projects linked to my teams
router.get("/my-manager-projects", getManagerProjects);

// Admin: user progress
router.get("/:userId/progress", requireAdmin, getUserProgress);

export default router;
