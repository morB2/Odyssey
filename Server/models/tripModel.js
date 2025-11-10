import mongoose from "mongoose";

const TripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    // The chosen/selected trip (can be the AI suggestion the user picked)
    title: { type: String },
    description: { type: String },
    // Final optimized route (optional)
    optimizedRoute: {
      ordered_route: [
        {
          name: { type: String },
          lat: { type: Number },
          lon: { type: Number },
          note: { type: String },
        },
      ],
      mode: {
        type: String,
        enum: ["driving", "walking", "transit"],
        default: "driving",
      },
      instructions: { type: [String], default: [] },
      google_maps_url: { type: String },
    },
    activities: { type: [String], default: [] },
    notes: { type: String },
    visabilityStatus: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Trip", TripSchema);
