
import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  },
  { timestamps: true }
);

// Optional: ensure a user can like a trip only once
LikeSchema.index({ user: 1, trip: 1 }, { unique: true });

// Index for aggregating likes per trip (used in feed metadata)
LikeSchema.index({ trip: 1, createdAt: -1 });

export default mongoose.model("Like", LikeSchema);
