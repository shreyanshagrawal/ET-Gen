# 🚀 AI-Powered Project Planner — Implementation Plan

## Current State Analysis
- **Backend**: Express + MongoDB (Mongoose), JWT auth, basic project/task/milestone CRUD
- **Frontend**: React (Vite) + TailwindCSS + shadcn/ui, basic pages only
- **Missing**: Teams, AI integration, RBAC roles, Kanban/Gantt, scoring, notifications

---

## Phase 1 — Backend Extensions

### New/Updated Models
| Model | Changes |
|---|---|
| `User` | Add `role` (admin/manager/member), `skills[]`, `teamId` |
| `Team` | New: name, description, members[], managerId |
| `Project` | Add `requirements`, `techStack`, `approvalStatus`, `teamId`, `aiTasksGenerated` |
| `Task` | Add `priority`, `epicId`, `parentTaskId`, `type` (epic/task/subtask), `dependencies[]`, `aiScore`, `submissions[]`, `estimatedHours` |
| `Submission` | New: taskId, userId, content, fileUrl, aiReview, aiScore, status, version |
| `Notification` | New: userId, message, type, read, link |
| `AILog` | New: projectId, type (task-gen/review/scoring), input, output, timestamp |

### New API Routes
```
POST /api/v1/ai/generate-tasks          → AI task breakdown
POST /api/v1/ai/assign-tasks            → AI smart assignment
POST /api/v1/ai/review-submission       → AI code review
POST /api/v1/ai/score-submission        → AI scoring
POST /api/v1/ai/generate-docs           → Final documentation

POST /api/v1/teams                      → Create team
GET  /api/v1/teams                      → All teams
GET  /api/v1/teams/:id                  → Team details
POST /api/v1/teams/:id/members          → Add member

PATCH /api/v1/projects/:id/approve      → Approve project
PATCH /api/v1/projects/:id/reject       → Reject project

POST /api/v1/tasks/:id/submit           → Submit work
GET  /api/v1/tasks/:id/submissions      → Task submissions

GET  /api/v1/users/me/tasks             → My tasks
GET  /api/v1/users/:id/performance      → User performance score
GET  /api/v1/projects/:id/leaderboard   → Team leaderboard
```

---

## Phase 2 — Frontend Architecture

### Pages & Routes
```
/login                        → Login
/signup                       → Signup
/dashboard                    → Role-aware redirect

/admin
  /admin/dashboard            → Admin overview
  /admin/projects             → All projects
  /admin/projects/new         → Create project
  /admin/projects/:id         → Project detail (approve/edit tasks/AI)
  /admin/teams                → Teams management
  /admin/teams/:id            → Team detail
  /admin/users                → All users

/manager
  /manager/dashboard          → Manager overview
  /manager/projects/:id       → Project + kanban
  /manager/team               → Team members

/member
  /member/dashboard           → Member tasks
  /member/projects/:id        → Project view
  /member/tasks/:id           → Task detail + submit
```

### Key UI Components
- `KanbanBoard` — drag-drop task cards (Pending/In Progress/Review/Done)
- `GanttChart` — timeline visualization
- `AITaskPanel` — AI task generation UI with edit/regenerate
- `SubmissionPanel` — submit work + AI review results
- `PerformanceCard` — scores, progress rings
- `LeaderboardTable` — team rankings
- `NotificationBell` — real-time notifications
- `AIChat` — embedded AI assistant

---

## Phase 3 — Design System
- **Theme**: Dark mode default, deep navy/slate + electric violet accent
- **Font**: Inter (Google Fonts)
- **Style**: Glassmorphism cards, gradient buttons, smooth transitions
- **Charts**: Recharts for progress/performance visualization

---

## Build Order
1. ✅ Backend model updates
2. ✅ New backend controllers + routes (Teams, AI, Submissions)
3. ✅ Frontend design system + layout shell
4. ✅ Auth pages (Login/Signup)
5. ✅ Admin dashboard + project management
6. ✅ AI task generation page
7. ✅ Kanban board + task tracking
8. ✅ Member dashboard + task submission
9. ✅ Performance & leaderboard
10. ✅ Notifications
