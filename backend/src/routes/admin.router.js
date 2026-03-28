import express from "express";
import {
    getAllProjects,
    createProject,
    addMembers,
    removeProjectLead,
    removeDev,
    deleteProject,
    allUsers,
    addProjectLead,
    userDetails,
    approveProject,
    rejectProject
} from "../controllers/admin.controller.js";
import { verifyJWT, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// -----------------------------
// Admin-only routes
// All routes require admin auth
// -----------------------------
router.use(verifyJWT, requireAdmin);

// GET all projects
// GET /api/v1/projects/admin
router.get("/", getAllProjects);

// GET all users
// GET/api/v1/admin/all-users
router.get("/all-users", allUsers)

// GET user details
// GET /api/v1/admin/user/:userID
router.get("/user/:userID", userDetails)

// CREATE a project
// POST /api/v1/projects/admin
router.post("/", createProject);

// ADD a lead to a project
router.post("/:projectID/add-lead", addProjectLead);


// ADD a member (dev) to a project
router.post("/:projectID/add-dev", addMembers);

// REMOVE project lead (owner becomes new lead)
// PATCH /api/v1/projects/admin/remove-lead
router.patch("/remove-lead", removeProjectLead);

// REMOVE developer from a project
// PATCH /api/v1/projects/admin/remove-dev
router.patch("/remove-dev", removeDev);

// APPROVE project
router.patch("/:projectID/approve", approveProject);

// REJECT project
router.patch("/:projectID/reject", rejectProject);

// DELETE a project completely
// DELETE /api/v1/projects/admin/:projectID
router.delete("/:projectID", deleteProject);

export default router;