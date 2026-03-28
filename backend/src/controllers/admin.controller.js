import { asyncHandler } from "../middleware/AsyncHandler.js";
import { ProjectMember } from "../models/projectMemberModel.js";
import { Project } from "../models/projectModel.js";
import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notificationModel.js";

const getAllProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find()
        .populate({
            path: "milestones",
            populate: {
                path: "tasks",
                select: "_id title desc status assignedTo",
                populate: { path: "assignedTo", select: "username -_id" }

            }
        });


    return res
        .status(200)
        .json(new ApiResponse(200, projects, "Fetched all projects"))
})

const createProject = asyncHandler(async (req, res) => {
    const { title, description, startDate, endDate, status, projectLeadID } = req.body
    if (!title || !description || !startDate || !endDate || !status || !projectLeadID) {
        throw new ApiError(400, "Fill all the requirements to create project properly")
    }

    const projectLead = await User.findById(projectLeadID)
    if (!projectLead) {
        throw new ApiError(404, "User not found")
    }

    const newProject = await Project.create({
        title,
        description,
        startDate,
        endDate,
        status,
        owner: req.user?._id
    })

    await ProjectMember.create({
        userID: projectLeadID,
        projectID: newProject._id,
        role: "lead"
    })

    const projectWithOwner = await Project.findById(newProject._id)
        .populate("owner", "name email")
        .lean();

    return res
        .status(201)
        .json(new ApiResponse(201, projectWithOwner, "Project created successfully"))
})

// TODO: add multiple devs at once
const addMembers = asyncHandler(async (req, res) => {
    const { userID } = req.body
    const { projectID } = req.params
    if (!projectID) throw new ApiError(400, "Project ID not provided")
    if (!userID) throw new ApiError(400, "Member ID not provided")

    // Check if project exists
    const project = await Project.findById(projectID);
    if (!project) throw new ApiError(404, "Project not found");

    // Check if member exists
    const user = await User.findById(userID);
    if (!user) throw new ApiError(404, "User not found");

    // Prevent duplicate membership
    const existing = await ProjectMember.findOne({ projectID, userID: userID });
    if (existing) throw new ApiError(400, "User is already a member of this project");


    const newMembership = await ProjectMember.create({
        userID: userID,
        projectID: projectID,
        role: "dev"
    })

    return res
        .status(201)
        .json(new ApiResponse(201, newMembership, "Member added to project"))
})

const addProjectLead = asyncHandler(async (req, res) => {
    const { projectID } = req.params
    if (!projectID) throw new ApiError(400, "Projct ID not provided")

    const project = await Project.findById(projectID)
    if (!project) throw new ApiError(404, "Project not found")

    const existingLead = await ProjectMember.exists({
        projectID,
        role: "lead"
    })
    if (existingLead) throw new ApiError(400, "This project has a lead assigned to it")

    const newLead = await ProjectMember.create({
        userID: req.user?._id,
        projectID,
        role: "lead"
    })

    return res
        .status(200)
        .json(new ApiResponse(200, newLead, "User assigned as new lead"))
})

const removeProjectLead = asyncHandler(async (req, res) => {
    const { projectID } = req.body;

    if (!projectID) {
        throw new ApiError(400, "Project ID is required");
    }

    // Find existing lead for the project
    const existingLead = await ProjectMember.findOne({
        projectID,
        role: "lead"
    });

    if (!existingLead) {
        throw new ApiError(404, "No lead found for this project");
    }

    // Remove current lead
    await ProjectMember.deleteOne({ _id: existingLead._id });

    // Fetch project
    const project = await Project.findById(projectID);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Assign owner as new lead
    const newLead = await ProjectMember.create({
        userID: project.owner,
        projectID,
        role: "lead"
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            newLead,
            "Existing lead removed and owner assigned as new lead"
        )
    );
})

const removeDev = asyncHandler(async (req, res) => {
    const { projectID, userID } = req.body
    if (!projectID || !userID) throw new ApiError(400, "Project or Member ID not provided")

    const project = await ProjectMember.findOne({
        userID: userID,
        projectID,
        role: "dev"
    })
    if (!project) throw new ApiError(404, "Member for this project not found")
    await project.deleteOne()

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Developer removed from this project"))
})

const deleteProject = asyncHandler(async (req, res) => {
    const { projectID } = req.params;
    if (!projectID)
        throw new ApiError(400, "Project ID not received");

    const project = await Project.findById(projectID);
    if (!project)
        throw new ApiError(404, "Project Not Found");

    await ProjectMember.deleteMany({ projectID });
    await Project.findByIdAndDelete(projectID);

    return res.status(200).json(
        new ApiResponse(200, {}, "Project deleted successfully")
    );
})

const allUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password -refreshToken -createdAt -updatedAt")
    return res
        .status(200)
        .json(new ApiResponse(200, users, "Fetched all users"))
})

const userDetails = asyncHandler(async (req, res) => {
    const { userID } = req.params
    if (!userID) throw new ApiError(400, "User ID not provided")

    // User details
    const user = await User.findById(userID).select("-password -refreshToken -createdAt -updatedAt")
    if (!user) throw new ApiError(404, "User not found")

    // User projects
    const memberships = await ProjectMember.find({ userID })
        .populate({path: "projectID", select: "title desc status owner"})

    const projects = memberships.map(m => m.projectID)






    return res
        .status(200)
        .json(new ApiResponse(200, { user: user, projects: projects }, "User details fetched"))
})

const approveProject = asyncHandler(async (req, res) => {
    const { projectID } = req.params;
    const project = await Project.findById(projectID);
    if (!project) throw new ApiError(404, "Project not found");
    project.approvalStatus = "approved";
    project.status = "ONGOING";
    await project.save();
    await Notification.create({
        userId: project.owner,
        message: `Your project "${project.title}" has been approved!`,
        type: "project_approved",
        link: `/projects/${project._id}`
    });
    return res.status(200).json(new ApiResponse(200, project, "Project approved"));
});

const rejectProject = asyncHandler(async (req, res) => {
    const { projectID } = req.params;
    const { reason } = req.body;
    const project = await Project.findById(projectID);
    if (!project) throw new ApiError(404, "Project not found");
    project.approvalStatus = "rejected";
    project.status = "REJECTED";
    await project.save();
    await Notification.create({
        userId: project.owner,
        message: `Your project "${project.title}" was rejected. ${reason ? 'Reason: ' + reason : ''}`,
        type: "project_rejected",
        link: `/projects/${project._id}`
    });
    return res.status(200).json(new ApiResponse(200, project, "Project rejected"));
});

export {
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
}