import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const uploadToCloudinary = async (filePath, folder = "odyssey") => {
    try {
        if (!filePath) return null;

        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
        });

        // Delete local file after upload
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        // Attempt to delete local file even if upload fails to avoid clutter
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};
