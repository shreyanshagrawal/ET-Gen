import express from "express";
import { addMilestone, addTask, deleteMilestone, deleteTask, editMilestone, getMyProjects, getProjectByID, updateTaskStatus } from "../controllers/project.controller.js";
import { verifyJWT, requireProjectLead, requireAdmin } from "../middleware/auth.middleware.js";
import { addMembers } from "../controllers/admin.controller.js";

const router = express.Router();
router.use(verifyJWT)
// -----------------------------
// GET all projects of the logged-in user
// GET /api/v1/projects/my
// -----------------------------
router.get("/my", verifyJWT, getMyProjects);

// -----------------------------
// GET project by ID
// GET /api/v1/projects/:projectID
// -----------------------------
router.get("/:projectID", verifyJWT, getProjectByID);

// -----------------------------
// POST Add developer to project
// POST /api/v1/projects/:projectID/add-dev
// -----------------------------
// TODO: Test this endpoint
router.post("/:projectID/add-dev", requireProjectLead ,addMembers);



router.post("/:projectID/add-milestone", requireProjectLead, addMilestone)

router.delete("/:projectID/delete-milestone/:milestoneID", requireProjectLead, deleteMilestone)


// Edit milestone
router.patch("/:projectID/edit-milestone/:milestoneID", requireProjectLead, editMilestone)


router.post("/:projectID/milestone/:milestoneID/add-task", requireProjectLead, addTask)

// Delete task
router.delete("/:projectID/task/:taskID",  deleteTask)

// Update task status
router.patch("/:projectID/task/:taskID",  updateTaskStatus)





// -----------------------------
// Optional future routes you can add
// -----------------------------
// router.patch("/:projectID", verifyJWT, requireProjectLead, updateProject);
// router.get("/:projectID/members", verifyJWT, requireProjectLead, getProjectMembers);
// router.post("/:projectID/members", verifyJWT, requireProjectLead, addProjectMember);
// router.patch("/:projectID/members/:memberID", verifyJWT, requireProjectLead, updateMemberRole);
// router.delete("/:projectID/members/:memberID", verifyJWT, requireProjectLead, removeProjectMember);

export default router;