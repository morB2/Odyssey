import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    trips: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
    }],
    image: {
        type: String, // URL to cover image
    },
    isPrivate: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Index for faster queries by user
collectionSchema.index({ user: 1 });

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;
