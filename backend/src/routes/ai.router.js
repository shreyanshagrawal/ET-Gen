import express from "express";
import { generateTasks, assignTasks, reviewSubmission, generateDocs } from "../controllers/ai.controller.js";
import { verifyJWT, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(verifyJWT);

// POST /api/v1/ai/generate-tasks/:projectId
router.post("/generate-tasks/:projectId", requireAdmin, generateTasks);

// POST /api/v1/ai/assign-tasks/:projectId
router.post("/assign-tasks/:projectId", requireAdmin, assignTasks);

// POST /api/v1/ai/review-submission/:submissionId
router.post("/review-submission/:submissionId", reviewSubmission);

// POST /api/v1/ai/generate-docs/:projectId
router.post("/generate-docs/:projectId", requireAdmin, generateDocs);

export default router;
