import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/userModel.js";
import { asyncHandler } from "./AsyncHandler.js";
import { Project } from "../models/projectModel.js";
import { ProjectMember } from "../models/projectMemberModel.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    // Take the token from cookie
    const token = req.cookies?.accessToken
    if (!token) {
        throw new ApiError(401, "Unauthorised access")
    }

    // Decode the token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    // Find the user and make req.user obj
    const user = await User.findById(decoded._id).select("-password -refreshToken")
    if (!user) {
        throw new ApiError(401, "Invalid access token")
    }

    req.user = user
    next()
})

export const requireAdmin = (req, _, next) => {
    if (!req.user)
        throw new ApiError(401, "Unauthorised access");

    if (req.user.role !== "admin")
        throw new ApiError(403, "Admin access required");

    next();
};

export const requireManager = (req, _, next) => {
    if (!req.user)
        throw new ApiError(401, "Unauthorised access");

    if (req.user.role !== "manager" && req.user.role !== "admin")
        throw new ApiError(403, "Manager or Admin access required");

    next();
};

export const requireProjectLead = asyncHandler(async (req, _, next) => {
    const { projectID } = req.params;

    if (!projectID)
        throw new ApiError(400, "Project ID not provided");

    const project = await Project.findById(projectID);
    if (!project)
        throw new ApiError(404, "Project not found");

    // const isOwner = project.owner === req.user?._id

    const isOwner = project.owner.toString() === req.user?._id.toString()

    const isLead = await ProjectMember.exists({
        projectID,
        userID: req.user?._id,
        role: "lead"
    });

    if(!isLead && !isOwner) throw new ApiError(404, "You need to be eithr owner or lead of this project to make changes")
    
    next();
});