import express from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", logoutUser)
router.post("/refresh-access-token", refreshAccessToken)

export default router