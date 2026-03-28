import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    requirements: {
      type: String,
      default: ""
    },
    techStack: [{
      type: String
    }],
    startDate: Date,
    endDate: Date,

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "ONGOING", "COMPLETED", "REJECTED", "DROPPED"],
      default: "PENDING"
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null
    },

    aiTasksGenerated: {
      type: Boolean,
      default: false
    },

    finalDocumentation: {
      type: String,
      default: null
    },

    milestones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Milestone"
      }
    ]
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);