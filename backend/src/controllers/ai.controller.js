import { asyncHandler } from "../middleware/AsyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/projectModel.js";
import { Task } from "../models/taskModel.js";
import { Milestone } from "../models/milestoneModel.js";
import { User } from "../models/userModel.js";
import { Submission } from "../models/submissionModel.js";
import { Notification } from "../models/notificationModel.js";

// Mock AI helper — replace with actual OpenAI call in production
const callOpenAI = async (prompt) => {
  // In production: replace with openai.chat.completions.create(...)
  // For demo, we return structured mock responses
  return null;
};

// ─────────────────────────────────────────────────────────
//  POST /api/v1/ai/generate-tasks/:projectId
//  Analyze project and generate Epic → Task → Subtask tree
// ─────────────────────────────────────────────────────────
export const generateTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) throw new ApiError(400, "Project ID required");

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  // Check approval
  if (project.approvalStatus !== "approved")
    throw new ApiError(400, "Project must be approved before generating tasks");

  // Mock AI-generated task structure based on project details
  const mockTasks = generateMockTaskStructure(project);

  // Persist generated tasks into milestones
  const milestoneIds = [];
  for (const epic of mockTasks) {
    // Create milestone for each epic
    const milestone = await Milestone.create({
      title: epic.title,
      projectID: projectId
    });

    // Create epic task
    const epicTask = await Task.create({
      title: epic.title,
      desc: epic.description,
      type: "epic",
      priority: epic.priority || "high",
      estimatedHours: epic.estimatedHours || 8,
      milestoneID: milestone._id,
      projectID: projectId,
      status: "pending"
    });

    // Create child tasks
    for (const task of epic.tasks || []) {
      const childTask = await Task.create({
        title: task.title,
        desc: task.description,
        type: "task",
        priority: task.priority || "medium",
        estimatedHours: task.estimatedHours || 4,
        parentTaskId: epicTask._id,
        milestoneID: milestone._id,
        projectID: projectId,
        status: "pending"
      });

      // Create subtasks
      for (const sub of task.subtasks || []) {
        await Task.create({
          title: sub.title,
          desc: sub.description,
          type: "subtask",
          priority: sub.priority || "low",
          estimatedHours: sub.estimatedHours || 2,
          parentTaskId: childTask._id,
          milestoneID: milestone._id,
          projectID: projectId,
          status: "pending"
        });
      }
    }

    milestoneIds.push(milestone._id);
  }

  // Link milestones to project
  await Project.findByIdAndUpdate(projectId, {
    milestones: milestoneIds,
    aiTasksGenerated: true,
    status: "ONGOING"
  });

  const updatedProject = await Project.findById(projectId).populate({
    path: "milestones",
    populate: { path: "tasks" }
  });

  return res.status(200).json(
    new ApiResponse(200, updatedProject, "AI tasks generated successfully")
  );
});

// ─────────────────────────────────────────────────────────
//  POST /api/v1/ai/assign-tasks/:projectId
//  AI smart task assignment based on roles & skills
// ─────────────────────────────────────────────────────────
export const assignTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { teamId } = req.body;

  if (!projectId || !teamId) throw new ApiError(400, "Project ID and Team ID required");

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  const team = await (await import("../models/teamModel.js")).Team.findById(teamId).populate("members");
  if (!team) throw new ApiError(404, "Team not found");

  const tasks = await Task.find({ projectID: projectId, type: { $in: ["task", "subtask"] } });
  if (!tasks.length) throw new ApiError(400, "No tasks found. Generate tasks first.");

  const members = team.members;
  if (!members.length) throw new ApiError(400, "Team has no members.");

  // Round-robin assignment with workload balancing
  const workloadMap = {};
  members.forEach(m => { workloadMap[m._id.toString()] = 0; });

  const assignments = [];
  for (let i = 0; i < tasks.length; i++) {
    // Find member with least workload
    const memberId = Object.keys(workloadMap).sort(
      (a, b) => workloadMap[a] - workloadMap[b]
    )[0];

    await Task.findByIdAndUpdate(tasks[i]._id, { assignedTo: memberId });
    workloadMap[memberId] += tasks[i].estimatedHours || 1;
    assignments.push({ taskId: tasks[i]._id, assignedTo: memberId, title: tasks[i].title });

    // Send notification
    await Notification.create({
      userId: memberId,
      message: `You have been assigned task: "${tasks[i].title}"`,
      type: "task_assigned",
      link: `/member/tasks/${tasks[i]._id}`
    });
  }

  // Update project team
  project.teamId = teamId;
  await project.save();

  return res.status(200).json(
    new ApiResponse(200, { assignments, totalTasks: tasks.length }, "Tasks assigned successfully by AI")
  );
});

// ─────────────────────────────────────────────────────────
//  POST /api/v1/ai/review-submission/:submissionId
//  AI review of submitted code/work
// ─────────────────────────────────────────────────────────
export const reviewSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  if (!submissionId) throw new ApiError(400, "Submission ID required");

  const submission = await Submission.findById(submissionId).populate("taskId userId");
  if (!submission) throw new ApiError(404, "Submission not found");

  // Mock AI review (replace with real OpenAI call in production)
  const aiReview = generateMockAIReview(submission);

  submission.aiReview = aiReview;
  submission.status = "reviewed";
  await submission.save();

  // Update task AI score
  await Task.findByIdAndUpdate(submission.taskId._id, {
    aiScore: aiReview.score,
    aiReviewSummary: aiReview.summary
  });

  // Notify user
  await Notification.create({
    userId: submission.userId._id,
    message: `AI review complete for your submission on "${submission.taskId.title}". Score: ${aiReview.score}/100`,
    type: "submission_reviewed",
    link: `/member/tasks/${submission.taskId._id}`
  });

  return res.status(200).json(
    new ApiResponse(200, submission, "AI review completed")
  );
});

// ─────────────────────────────────────────────────────────
//  POST /api/v1/ai/generate-docs/:projectId
//  Generate final documentation for completed project
// ─────────────────────────────────────────────────────────
export const generateDocs = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) throw new ApiError(400, "Project ID required");

  const project = await Project.findById(projectId)
    .populate("owner", "username email")
    .populate("teamId");
  if (!project) throw new ApiError(404, "Project not found");

  const tasks = await Task.find({ projectID: projectId })
    .populate("assignedTo", "username");

  const completedTasks = tasks.filter(t => t.status === "completed");
  const totalScore = tasks.reduce((sum, t) => sum + (t.aiScore || 0), 0);
  const avgScore = tasks.length ? Math.round(totalScore / tasks.length) : 0;

  const doc = `# ${project.title} — Final Project Report

## Project Overview
**Description:** ${project.description}
**Requirements:** ${project.requirements || "N/A"}
**Tech Stack:** ${(project.techStack || []).join(", ") || "N/A"}
**Start Date:** ${project.startDate ? new Date(project.startDate).toDateString() : "N/A"}
**End Date:** ${project.endDate ? new Date(project.endDate).toDateString() : "N/A"}

## Completion Summary
- **Total Tasks:** ${tasks.length}
- **Completed Tasks:** ${completedTasks.length}
- **Completion Rate:** ${tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
- **Average AI Score:** ${avgScore}/100

## Task Breakdown
${tasks.map(t => `- [${t.status.toUpperCase()}] ${t.title} — Assigned to: ${t.assignedTo?.username || "Unassigned"} | Score: ${t.aiScore || "N/A"}`).join("\n")}

## Architecture Overview
This project was built using ${(project.techStack || []).join(", ") || "modern web technologies"}.
The system was structured into ${completedTasks.length} completed modules across multiple milestones.

---
*Generated by AI Project Planner on ${new Date().toDateString()}*
`;

  project.finalDocumentation = doc;
  project.status = "COMPLETED";
  await project.save();

  return res.status(200).json(
    new ApiResponse(200, { documentation: doc, project }, "Final documentation generated")
  );
});

// ─────────────────────────────────────────────
//  Helper: Mock AI task structure generator
// ─────────────────────────────────────────────
function generateMockTaskStructure(project) {
  const techStack = project.techStack?.join(", ") || "full-stack";
  return [
    {
      title: "Project Setup & Architecture",
      description: `Set up the initial project structure for ${project.title}`,
      priority: "critical",
      estimatedHours: 8,
      tasks: [
        {
          title: "Initialize Repository & CI/CD",
          description: "Set up version control, branching strategy, and CI/CD pipeline",
          priority: "high",
          estimatedHours: 4,
          subtasks: [
            { title: "Create Git repository", description: "Initialize git with .gitignore", estimatedHours: 1 },
            { title: "Configure CI pipeline", description: "Set up GitHub Actions or equivalent", estimatedHours: 2 }
          ]
        },
        {
          title: "Configure Tech Stack",
          description: `Configure ${techStack} dependencies and project scaffold`,
          priority: "high",
          estimatedHours: 4,
          subtasks: [
            { title: "Install core dependencies", description: "Set up package.json and install deps", estimatedHours: 1 },
            { title: "Configure environment variables", description: "Set up .env files for each environment", estimatedHours: 1 }
          ]
        }
      ]
    },
    {
      title: "Backend Development",
      description: "Build API layer, database models, and business logic",
      priority: "high",
      estimatedHours: 24,
      tasks: [
        {
          title: "Database Schema Design",
          description: "Design and implement database models",
          priority: "high",
          estimatedHours: 6,
          subtasks: [
            { title: "Define core entities", description: "Map out all data models and relationships", estimatedHours: 2 },
            { title: "Implement models", description: "Code the database schemas", estimatedHours: 3 }
          ]
        },
        {
          title: "REST API Implementation",
          description: "Build all required API endpoints",
          priority: "high",
          estimatedHours: 12,
          subtasks: [
            { title: "Authentication endpoints", description: "JWT-based login/register/logout", estimatedHours: 3 },
            { title: "Core CRUD endpoints", description: "Main resource endpoints", estimatedHours: 6 },
            { title: "API documentation", description: "Document all endpoints", estimatedHours: 2 }
          ]
        }
      ]
    },
    {
      title: "Frontend Development",
      description: "Build user interface and integrate with backend",
      priority: "high",
      estimatedHours: 20,
      tasks: [
        {
          title: "UI Design System",
          description: "Create reusable component library and design tokens",
          priority: "medium",
          estimatedHours: 6,
          subtasks: [
            { title: "Color palette & typography", description: "Define design tokens", estimatedHours: 2 },
            { title: "Base components", description: "Build Button, Input, Card components", estimatedHours: 3 }
          ]
        },
        {
          title: "Core Pages Implementation",
          description: "Build all application pages",
          priority: "high",
          estimatedHours: 12,
          subtasks: [
            { title: "Authentication pages", description: "Login, Register, Forgot Password", estimatedHours: 3 },
            { title: "Dashboard pages", description: "Main dashboard views", estimatedHours: 5 }
          ]
        }
      ]
    },
    {
      title: "Testing & QA",
      description: "Write tests and perform quality assurance",
      priority: "medium",
      estimatedHours: 8,
      tasks: [
        {
          title: "Unit Testing",
          description: "Write unit tests for critical functions",
          priority: "medium",
          estimatedHours: 4,
          subtasks: [
            { title: "Backend unit tests", description: "Test controllers and models", estimatedHours: 2 },
            { title: "Frontend unit tests", description: "Test components and hooks", estimatedHours: 2 }
          ]
        },
        {
          title: "Integration & E2E Testing",
          description: "End-to-end testing of critical workflows",
          priority: "medium",
          estimatedHours: 4,
          subtasks: [
            { title: "API integration tests", description: "Test API endpoints end-to-end", estimatedHours: 2 },
            { title: "User flow testing", description: "Test critical user journeys", estimatedHours: 2 }
          ]
        }
      ]
    },
    {
      title: "Deployment & Documentation",
      description: "Deploy application and write final documentation",
      priority: "medium",
      estimatedHours: 8,
      tasks: [
        {
          title: "Production Deployment",
          description: "Deploy to production environment",
          priority: "high",
          estimatedHours: 4,
          subtasks: [
            { title: "Set up production server", description: "Configure hosting and SSL", estimatedHours: 2 },
            { title: "Deploy and smoke test", description: "Deploy and verify production works", estimatedHours: 2 }
          ]
        },
        {
          title: "Documentation",
          description: "Write technical and user documentation",
          priority: "low",
          estimatedHours: 4,
          subtasks: [
            { title: "README & setup guide", description: "Document how to run the project", estimatedHours: 2 }
          ]
        }
      ]
    }
  ];
}

// ─────────────────────────────────────────────
//  Helper: Mock AI review generator
// ─────────────────────────────────────────────
function generateMockAIReview(submission) {
  const content = submission.content || "";
  const length = content.length;
  const score = Math.min(100, Math.max(40, 60 + Math.floor(length / 50)));

  return {
    summary: `The submission has been reviewed by AI. The work demonstrates ${score >= 80 ? "excellent" : score >= 60 ? "good" : "adequate"} understanding of the requirements.`,
    codeQuality: score,
    bugs: score < 70 ? [
      "Potential null reference in main handler",
      "Missing error handling for async operations"
    ] : [],
    suggestions: [
      "Consider adding more inline comments for clarity",
      "Extract magic numbers into named constants",
      score < 80 ? "Add input validation for edge cases" : "Excellent code structure — consider adding JSDoc for public APIs"
    ],
    score
  };
}
