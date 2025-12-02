import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    reactions: [
      {
        emoji: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    replies: [replySchema],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true } // enable comment IDs for editing/deleting later
);

const TripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    title: { type: String },
    description: { type: String },
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
    // ✅ Use sub-schema here
    comments: [commentSchema],
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    images: {
      type: [String],
      validate: [arrayLimit, "{PATH} exceeds the limit of 3"],
    },
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length <= 3;
}

// Middleware to delete related records when a Trip is deleted
TripSchema.pre('findOneAndDelete', async function (next) {
  try {
    // Get the trip ID from the query
    const tripId = this.getQuery()._id;

    if (tripId) {
      // Dynamically import the models to avoid circular dependencies
      const { default: Like } = await import('./likesModel.js');
      const { default: Save } = await import('./savesModel.js');
      const { default: Report } = await import('./reportModel.js');

      // Delete all likes for this trip
      await Like.deleteMany({ trip: tripId });

      // Delete all saves for this trip
      await Save.deleteMany({ trip: tripId });

      // Delete all reports for this trip
      await Report.deleteMany({ trip: tripId });

      console.log(`Cleaned up related records for trip ${tripId}`);
    }

    next();
  } catch (error) {
    console.error('Error in Trip pre-delete middleware:', error);
    next(error);
  }
});

export default mongoose.model("Trip", TripSchema);
