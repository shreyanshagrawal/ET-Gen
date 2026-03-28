import mongoose from "mongoose"
import bcrypt from 'bcrypt'
import { ApiError } from '../utils/ApiErrors.js'
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "manager", "member"],
    default: "member"
  },
  skills: [{
    type: String
  }],
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null
  },
  performanceScore: {
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    default: null
  },
  refreshToken: {
    type: String
  }
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return
  try {
    this.password = await bcrypt.hash(this.password, 12)
  } catch (error) {
    throw new ApiError(500, "Failed to hash password")
  }
})

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign({
    _id: this._id,
    username: this.username,
    role: this.role
  },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  )
}

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign({
    _id: this._id
  },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  )
}

export const User = mongoose.model("User", userSchema);