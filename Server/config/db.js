// config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const DB_CONNECTION = process.env.DB_CONNECTION;

if (!DB_CONNECTION) {
    console.error("Error: MONGO_URI not defined in .env");
    process.exit(1);
}

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB:", process.env.DB_CONNECTION);
        await mongoose.connect(process.env.DB_CONNECTION);
        console.log("MongoDB Connected");
    } catch (err) {

        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};
connectDB();

export default connectDB;
