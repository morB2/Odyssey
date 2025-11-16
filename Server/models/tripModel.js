// import mongoose from "mongoose";

// const TripSchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
//     title: { type: String },
//     description: { type: String },
//     optimizedRoute: {
//       ordered_route: [
//         {
//           name: { type: String },
//           lat: { type: Number },
//           lon: { type: Number },
//           note: { type: String },
//         },
//       ],
//       mode: {
//         type: String,
//         enum: ["driving", "walking", "transit"],
//         default: "driving",
//       },
//       instructions: { type: [String], default: [] },
//       google_maps_url: { type: String },
//     },
//     activities: { type: [String], default: [] },
//     notes: { type: String },
//     visabilityStatus: {
//       type: String,
//       enum: ["private", "public"],
//       default: "private",
//     },
//     // New fields
//     comments: [
//       {
//         user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         comment: { type: String },
//         createdAt: { type: Date, default: Date.now },
//       },
//     ],
//     likes: { type: Number, default: 0 },
//     images: {
//       type: [String],
//       validate: [arrayLimit, "{PATH} exceeds the limit of 3"],
//     },
//   },
//   { timestamps: true }
// );

// // Custom validator for images array
// function arrayLimit(val) {
//   return val.length <= 3;
// }

// export default mongoose.model("Trip", TripSchema);
import mongoose from "mongoose";

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

export default mongoose.model("Trip", TripSchema);
