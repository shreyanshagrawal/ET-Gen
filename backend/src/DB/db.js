import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`)
        console.log("DB connected successfully ^_^")
    } catch (error) {
        console.log("Error connecting to Database: ", error)
    }
}

export default connectDB