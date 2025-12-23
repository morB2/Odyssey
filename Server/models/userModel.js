import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    birthday: { type: Date },
    preferences: { type: [String], default: [], index: true },
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    password: { type: String },
    status: { type: Boolean, default: true },
    resetToken: { type: String },
    resetTokenExpire: { type: Date },

  },
  { timestamps: true }
);

// -----------------------------------------------------
// Indexes for Performance Optimization
// -----------------------------------------------------

// Compound index for name-based search (used in admin search)
userSchema.index({ firstName: 1, lastName: 1 });

export default mongoose.model("User", userSchema);
