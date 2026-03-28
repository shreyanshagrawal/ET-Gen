import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    default: ""
  },
  fileUrl: {
    type: String,
    default: null
  },
  repoLink: {
    type: String,
    default: null
  },
  version: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ["submitted", "reviewed", "approved", "rejected"],
    default: "submitted"
  },
  aiReview: {
    summary: { type: String, default: null },
    codeQuality: { type: Number, default: null },
    bugs: [{ type: String }],
    suggestions: [{ type: String }],
    score: { type: Number, default: null }
  }
}, { timestamps: true });

export const Submission = mongoose.model("Submission", submissionSchema);
