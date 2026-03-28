import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["task_assigned", "submission_reviewed", "project_approved", "project_rejected", "ai_complete", "general"],
    default: "general"
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: null
  }
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);
