import { asyncHandler } from "../middleware/AsyncHandler.js";
import { Milestone } from "../models/milestoneModel.js";
import { ProjectMember } from "../models/projectMemberModel.js";
import { Project } from "../models/projectModel.js";
import { Task } from "../models/taskModel.js";
import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getMyProjects = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    let projects = await ProjectMember.aggregate([
        {
            $match: {
                userID: userId
            }
        },
        {
            $lookup: {
                from: "projects",
                localField: "projectID",
                foreignField: "_id",
                as: "projectDetails"
            }
        },
        {
            $unwind: "$projectDetails"
        },
        {
            $project: {
                projectID: 1,
                "projectDetails._id": 1,
                "projectDetails.title": 1,
                "projectDetails.description": 1,
                "projectDetails.status": 1,
                "projectDetails.endDate": 1
            }
        }
    ])
    
    return res
        .status(200)
        
        .json(new ApiResponse(200, projects, "User's project fetched"))
})

const getProjectByID = asyncHandler(async (req, res) => {
    const { projectID } = req.params
    if (!projectID) throw new ApiError(400, "Project ID not provided")

    // const project = await Project.findById(projectID)
    //     .populate({ path: "owner", select: "username -_id" })
    //     .populate({ path: "milestones", select: "_id title tasks" })

    // GPT
    let project = await Project.findById(projectID)
        .populate({ path: "owner", select: "username -_id" })
        .populate({
            path: "milestones",
            select: "_id title",
            populate: {
                path: "tasks",  // virtual field we just defined
                select: "title status assignedTo desc",
                populate: { path: "assignedTo", select: "username -_id" }
            }
        })

    if (!project) throw new ApiError(404, "Project not found")

    const hasAccess =
        project.owner.toString() === req.user._id.toString() ||
        await ProjectMember.exists({
            projectID,
            userID: req.user._id
        });

    if (!hasAccess) {
        throw new ApiError(403, "Not authorized to view this project");
    }

    const lead = await ProjectMember.findOne({ projectID, role: "lead" })
        .populate({ path: "userID", select: "username -_id" })
    const leadList = {
        _id: lead._id,
        username: lead.userID?.username
    }

    const devs = await ProjectMember.find({ projectID, role: "dev" }).populate({ path: "userID", select: "username -_id" })
    const devsList = devs.map(e => ({
        _id: e._id,
        username: e.userID?.username
    }));

    return res
        .status(200)
        .json(new ApiResponse(200, { project, Lead: leadList, Devs: devsList }, "Project fetched"))


})

const addMilestone = asyncHandler(async (req, res) => {
    const { projectID } = req.params
    if (!projectID) throw new ApiError(400, "Project ID not provided")

    const { mileStoneTitle } = req.body
    if (!mileStoneTitle) throw new ApiError(400, "Milestone's title not provided")

    const project = await Project.findById(projectID)
    if (!project) throw new ApiError(404, "Project not found")

    const mileStone = await Milestone.create({
        title: mileStoneTitle
    })

    project.milestones.push(mileStone)
    await project.save()

    return res
        .status(200)
        .json(new ApiResponse(200, mileStone, "Milestone Added"))
})

const deleteMilestone = asyncHandler(async (req, res) => {
    const { projectID, milestoneID } = req.params
    if (!projectID || !milestoneID) throw new ApiError(400, "Project or Milestone ID missing")

    const project = await Project.findById(projectID)
    if (!project) throw new ApiError(404, "Project not found")

    const milestone = await Milestone.findById(milestoneID)
    if (!milestone) throw new ApiError(404, "milestone not found")

    await milestone.deleteOne()

    await Project.updateOne(
        { _id: projectID },
        { $pull: { milestones: milestoneID } }
    );

    return res.status(200).json(new ApiResponse(200, {}, "Milestone deleted"))

})

const editMilestone = asyncHandler(async (req, res) => {
    const { projectID, milestoneID } = req.params
    if (!projectID || !milestoneID) throw new ApiError(400, "Project or milestone ID not provided")

    const { newTitle } = req.body
    if (!newTitle) throw new ApiError(400, "New Title not provided")

    const project = await Project.findById(projectID)
    if (!project) throw new ApiError(404, "Project not found")

    const milestone = await Milestone.findById(milestoneID)
    if (!milestone) throw new ApiError(404, "Milestone not found")

    milestone.title = newTitle
    await milestone.save()

    return res
        .status(200)
        .json(new ApiResponse(200, milestone, "Title updated"))
})

const addTask = asyncHandler(async (req, res) => {
    const { milestoneID } = req.params
    if (!milestoneID) throw new ApiError(400, "Milestone ID not provided")

    const milestone = await Milestone.findById(milestoneID)
    if (!milestone) throw new ApiError(404, "Milestone not found")

    const { title, desc, status, assignedTo } = req.body
    if (!title || !assignedTo) throw new ApiError(400, "All required fields not provided")

    const assignedToExists = await User.findById(assignedTo)
    if (!assignedToExists) throw new ApiError(404, "User you are trying to assign this task does not exists")

    const task = await Task.create({
        title,
        desc,
        status,
        assignedTo,
        milestoneID
    })

    return res
        .status(201)
        .json(new ApiResponse(201, task, "Task created sucessfully"))
})

const deleteTask = asyncHandler(async (req, res) => {
    const { projectID , taskID } = req.params
    if(!taskID) throw new ApiError(400, "Task ID not provided")
    
    const task = await Task.findById(taskID)
    if(!task) throw new ApiError(404, "Task not found")
    
    await task.deleteOne()
    return res
    .status(200)
    .json(new ApiResponse(200, task, "Task deleted successfully"))
})

const updateTaskStatus = asyncHandler(async (req, res) => {
    const { taskID } = req.params
    if(!taskID) throw new ApiError(400, "Task ID not provided")
    
    const task = await Task.findById(taskID)
    if(!task) throw new ApiError(404, "Task not found")
    
    const { status } = req.body
    if(!status) throw new ApiError(400, "Task status not provided")
    
    if(status !== "todo" && status !== "in-progress" && status !== "done") throw new ApiError(400, "Invalid status for task")
    
    task.status = status
    await task.save()

    return res
    .status(200)
    .json(new ApiResponse(200, task, "Task status updated"))
})

export {
    getMyProjects,
    getProjectByID,
    addMilestone,
    deleteMilestone,
    editMilestone,
    addTask,
    deleteTask,
    updateTaskStatus
}