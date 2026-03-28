import dotenv from "dotenv"
import connectDB from "./src/DB/db.js"
import app from "./app.js"
dotenv.config()


connectDB()

app.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.PORT}`)
})