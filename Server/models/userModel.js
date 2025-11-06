import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    birthday: { type: Date },
    preferences: { type: [mongoose.Schema.Types.Mixed], default: [] },
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    password: { type: String }, // אופציונלי אם בעתיד תרצי התחברות רגילה
  },
  { timestamps: true } // מוסיף createdAt ו-updatedAt אוטומטית
);

export default mongoose.model("User", userSchema);
