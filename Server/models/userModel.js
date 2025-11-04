import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        birthday: {
            type: Date,
        },
        preferences: {
            type: [mongoose.Schema.Types.Mixed], // or [mongoose.Schema.Types.Mixed] if you plan complex objects
            default: [],
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true, // allows null values but still enforces uniqueness when set
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

export default mongoose.model("User", userSchema);
