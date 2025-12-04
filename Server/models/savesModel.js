import mongoose from "mongoose";

const SaveSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    },
    { timestamps: true }
);

// Optional: ensure a user can save a trip only once
SaveSchema.index({ user: 1, trip: 1 }, { unique: true });

// Index for aggregating saves per trip (used in feed metadata)
SaveSchema.index({ trip: 1, createdAt: -1 });

export default mongoose.model("Save", SaveSchema);
