import mongoose from "mongoose";
import dotenv from "dotenv";
import { Task } from "../src/models/taskModel.js";
import { User } from "../src/models/userModel.js";
import { Milestone } from "../src/models/milestoneModel.js";
import { Project } from "../src/models/projectModel.js";
import { ProjectMember } from "../src/models/projectMemberModel.js";

dotenv.config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb://localhost:27017/Project_DB`);
    console.log("MongoDB connected for seeding tasks...");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

connectDB()

const seed = async () => {

  console.log("Cleaning database...");

  await User.deleteMany();
  await Project.deleteMany();
  await Milestone.deleteMany();
  await Task.deleteMany();
  await ProjectMember.deleteMany();

  console.log("Creating users...");

  const users = await User.create([
    { username: "abhi", email: "abhi@test.com", password: "password123", role: "admin" },
    { username: "arjun", email: "arjun@test.com", password: "password123" },
    { username: "meera", email: "meera@test.com", password: "password123" },
    { username: "rohan", email: "rohan@test.com", password: "password123" },
    { username: "isha", email: "isha@test.com", password: "password123" },
    { username: "kabir", email: "kabir@test.com", password: "password123" }
  ]);

  const [admin, u1, u2, u3, u4, u5] = users;

  console.log("Creating projects...");

  const project1 = await Project.create({
    title: "AI Powered Resume Analyzer",
    description: "Analyze resumes and suggest missing skills",
    owner: admin._id,
    startDate: new Date(),
    endDate: new Date("2026-05-15")
  });

  const project2 = await Project.create({
    title: "Smart Task Scheduler",
    description: "Task management system with priorities",
    owner: admin._id,
    startDate: new Date(),
    endDate: new Date("2026-06-01")
  });

  console.log("Creating milestones...");

  const milestones = await Milestone.create([
    { title: "Project Setup", projectID: project1._id },
    { title: "Backend APIs", projectID: project1._id },
    { title: "ML Integration", projectID: project1._id },

    { title: "Database Design", projectID: project2._id },
    { title: "Frontend Dashboard", projectID: project2._id }
  ]);

  const [m1, m2, m3, m4, m5] = milestones;

  project1.milestones = [m1._id, m2._id, m3._id];
  project2.milestones = [m4._id, m5._id];

  await project1.save();
  await project2.save();

  console.log("Creating tasks...");

  await Task.create([
    { title: "Initialize repo", milestoneID: m1._id, assignedTo: u1._id },
    { title: "Setup MongoDB", milestoneID: m1._id, assignedTo: u2._id },

    { title: "Auth APIs", milestoneID: m2._id, assignedTo: u3._id },
    { title: "Project routes", milestoneID: m2._id, assignedTo: u1._id },

    { title: "Resume parser", milestoneID: m3._id, assignedTo: u4._id },
    { title: "Skill gap logic", milestoneID: m3._id, assignedTo: u5._id },

    { title: "Schema design", milestoneID: m4._id, assignedTo: u2._id },
    { title: "Indexes setup", milestoneID: m4._id, assignedTo: u3._id },

    { title: "Dashboard UI", milestoneID: m5._id, assignedTo: u4._id },
    { title: "Task board UI", milestoneID: m5._id, assignedTo: u5._id }
  ]);

  console.log("Creating project members...");

  await ProjectMember.create([
    { userID: admin._id, projectID: project1._id, role: "lead" },
    { userID: u1._id, projectID: project1._id, role: "dev" },
    { userID: u2._id, projectID: project1._id, role: "dev" },
    { userID: u3._id, projectID: project1._id, role: "dev" },

    { userID: admin._id, projectID: project2._id, role: "lead" },
    { userID: u4._id, projectID: project2._id, role: "dev" },
    { userID: u5._id, projectID: project2._id, role: "dev" }
  ]);

  console.log("Seed complete 🌱");

  process.exit();
};

seed();