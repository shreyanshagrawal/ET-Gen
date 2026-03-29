import express from "express";
const app = express()
import cors from "cors"
import cookieParser from "cookie-parser";

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(cookieParser())

// Routes import
import projectRouter from './src/routes/projectsRouter.js'
import authRouter from './src/routes/auth.router.js'
import adminRouter from './src/routes/admin.router.js'
import aiRouter from './src/routes/ai.router.js'
import teamRouter from './src/routes/team.router.js'
import taskRouter from './src/routes/task.router.js'
import userRouter from './src/routes/user.router.js'

// Routes Declaration
app.use('/api/v1/projects', projectRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/ai', aiRouter)
app.use('/api/v1/teams', teamRouter)
app.use('/api/v1/tasks', taskRouter)
app.use('/api/v1/users', userRouter)

// Health check
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'AI Project Planner API is running' })
})

// Global error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    res.status(statusCode).json({
        success: false,
        statusCode,
        message: err.message || 'Internal Server Error'
    })
})

export default app