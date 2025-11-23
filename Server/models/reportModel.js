import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        reportedTrip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trip",
            required: true,
        },
        reason: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "resolved"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
