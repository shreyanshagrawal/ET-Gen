import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  desc: String,
  type: {
    type: String,
    enum: ["epic", "task", "subtask"],
    default: "task"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "review", "completed"],
    default: "pending"
  },
  milestoneID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Milestone"
  },
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  },
  parentTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    default: null
  },
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  estimatedHours: {
    type: Number,
    default: 0
  },
  aiScore: {
    type: Number,
    default: null
  },
  aiReviewSummary: {
    type: String,
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  }
}, { timestamps: true })

export const Task = mongoose.model("Task", taskSchema)