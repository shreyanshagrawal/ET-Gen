import mongoose from "mongoose";

// const milestoneSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true
//     },
//     tasks: [
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Task"
//         }
//     ]
// },{timestamps: true})


const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  projectID: { type: mongoose.Schema.Types.ObjectId, ref: "Project" } // add project ref if needed
}, { timestamps: true });

milestoneSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "milestoneID"
});

milestoneSchema.set("toObject", { virtuals: true });
milestoneSchema.set("toJSON", { virtuals: true });

export const Milestone = mongoose.model("Milestone", milestoneSchema)