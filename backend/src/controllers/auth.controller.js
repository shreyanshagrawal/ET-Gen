import { CookieOptions } from "../../constants.js";
import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../middleware/AsyncHandler.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId)
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
    return { accessToken, refreshToken }
}

const registerUser = asyncHandler(async (req, res) => {
    const refreshAccessToken = async (req, res) => {
        const incomingRefreshToken = req.cookies.refreshToken

        if (!incomingRefreshToken) {
            throw new ApiError(401, "unauthorised Request")
        }

        const decoded = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decoded._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token")
        }

        const { accessToken, refreshToken } = user.generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: refreshToken, accessToken
                    },
                    "Access Token Refreshed"
                )
            )

    }
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        throw new ApiError(400, "All three fields are required")
    }

    const existingUsername = await User.findOne({ username })
    if (existingUsername) {
        throw new ApiError(409, "Username already taken")
    }

    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
        throw new ApiError(409, "Email already registered")
    }

    const user = await User.create({
        username,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200, createdUser, "User Fetched"))
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) throw new ApiError(400, "Email and Password are required")

    const user = await User.findOne({ email })

    const verifyPassword = await user.isPasswordCorrect(password)
    if (!verifyPassword) {
        throw new ApiError(401, "Password is incorrect")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    user.refreshToken = refreshToken
    await user.save()

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
        .status(200)
        .cookie("accessToken", accessToken, CookieOptions)
        .cookie("refreshToken", refreshToken, CookieOptions)
        .json(new ApiResponse(200, loggedInUser, "Login Successful"))
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        }
    )

    return res
        .status(200)
        .clearCookie("accessToken", CookieOptions)
        .clearCookie("refreshToken", CookieOptions)
        .json(new ApiResponse(200, {}, "User logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorised request")
    }

    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decoded._id)
    if (!user) {
        throw new ApiError(401, "Invaid refresh token")
    }
    if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Invaid refresh token")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    return res
        .status(200)
        .cookie("accessToken", accessToken, CookieOptions)
        .json(
            new ApiResponse(200, {}, "Access Token renewed!")
        )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}