import mongoose from "mongoose";

const projectMemberSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    projectID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    role: {
      type: String,
      enum: ["lead", "dev"],
      required: true
    }
  },
  { timestamps: true }
);

export const ProjectMember = new mongoose.model("ProjectMember", projectMemberSchema)