import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true,
});

// ── Auth ──────────────────────────────────────
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const logout = () => API.post('/auth/logout');
export const refreshToken = () => API.post('/auth/refresh-token');

// ── Admin ─────────────────────────────────────
export const adminGetAllProjects = () => API.get('/admin/');
export const adminGetAllUsers = () => API.get('/admin/all-users');
export const adminGetUserDetails = (userId) => API.get(`/admin/user/${userId}`);
export const adminCreateProject = (data) => API.post('/admin/', data);
export const adminApproveProject = (projectId) => API.patch(`/admin/${projectId}/approve`);
export const adminRejectProject = (projectId, reason) => API.patch(`/admin/${projectId}/reject`, { reason });
export const adminDeleteProject = (projectId) => API.delete(`/admin/${projectId}`);
export const adminAddMember = (projectId, userID) => API.post(`/admin/${projectId}/add-dev`, { userID });

// ── Users ─────────────────────────────────────
export const getMyProfile = () => API.get('/users/profile');
export const updateMyProfile = (data) => API.patch('/users/profile', data);
export const getMyTeam = () => API.get('/users/my-team');
export const getMyManagedTeams = () => API.get('/users/my-managed-teams');
export const getManagerProjects = () => API.get('/users/my-manager-projects');
export const getUserProgress = (userId) => API.get(`/users/${userId}/progress`);

// ── Teams ─────────────────────────────────────
export const getAllTeams = () => API.get('/teams');
export const getTeamById = (teamId) => API.get(`/teams/${teamId}`);
export const createTeam = (data) => API.post('/teams', data);
export const addMemberToTeam = (teamId, userId) => API.post(`/teams/${teamId}/members`, { userId });
export const removeMemberFromTeam = (teamId, userId) => API.delete(`/teams/${teamId}/members/${userId}`);

// ── Projects ──────────────────────────────────
export const getMyProjects = () => API.get('/projects/my');
export const getProjectById = (projectId) => API.get(`/projects/${projectId}`);

// ── Tasks ─────────────────────────────────────
export const getMyTasks = () => API.get('/tasks/my-tasks');
export const getProjectTasks = (projectId) => API.get(`/tasks/project/${projectId}`);
export const updateTaskStatus = (taskId, status) => API.patch(`/tasks/${taskId}/status`, { status });
export const submitWork = (taskId, data) => API.post(`/tasks/${taskId}/submit`, data);
export const getTaskSubmissions = (taskId) => API.get(`/tasks/${taskId}/submissions`);
export const getLeaderboard = (projectId) => API.get(`/tasks/project/${projectId}/leaderboard`);

// ── AI ────────────────────────────────────────
export const aiGenerateTasks = (projectId) => API.post(`/ai/generate-tasks/${projectId}`);
export const aiAssignTasks = (projectId, teamId) => API.post(`/ai/assign-tasks/${projectId}`, { teamId });
export const aiReviewSubmission = (submissionId) => API.post(`/ai/review-submission/${submissionId}`);
export const aiGenerateDocs = (projectId) => API.post(`/ai/generate-docs/${projectId}`);

// ── Notifications ─────────────────────────────
export const getNotifications = () => API.get('/tasks/notifications');
export const markNotificationsRead = () => API.patch('/tasks/notifications/read-all');

export default API;
