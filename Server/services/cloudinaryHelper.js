import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const uploadToCloudinary = async (filePath, folder = "odyssey") => {
    try {
        if (!filePath) return null;

        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: "auto", // Automatically detect image or video
            // Compression settings to save storage and bandwidth
            quality: "auto:good", // Smart compression (70-80% size reduction with minimal quality loss)
            fetch_format: "auto", // Use WebP/AVIF for browsers that support it
            flags: "lossy", // Enable lossy compression for better file size
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

/**
 * Delete a file from Cloudinary
 * @param {string} urlOrPublicId - Cloudinary URL or public_id
 * @returns {Promise<object>} - Deletion result
 */
export const deleteFromCloudinary = async (urlOrPublicId) => {
    try {
        if (!urlOrPublicId) return null;

        let publicId = urlOrPublicId;

        // If it's a URL, extract the public_id
        if (urlOrPublicId.includes('cloudinary.com')) {
            // Extract public_id from URL
            // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/users/123/abc.jpg
            // public_id would be: users/123/abc
            const urlParts = urlOrPublicId.split('/upload/');
            if (urlParts.length > 1) {
                // Remove version (v1234567890) and get the path
                const pathWithVersion = urlParts[1];
                const pathParts = pathWithVersion.split('/');
                // Remove the first part if it starts with 'v' followed by numbers (version)
                const startIndex = pathParts[0].match(/^v\d+$/) ? 1 : 0;
                // Join the rest and remove file extension
                publicId = pathParts.slice(startIndex).join('/').replace(/\.[^/.]+$/, '');
            }
        }

        // Determine resource type (image or video)
        const resourceType = urlOrPublicId.includes('/video/') ? 'video' : 'image';

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });

        console.log(`Deleted from Cloudinary: ${publicId}`, result);
        return result;
    } catch (error) {
        console.error("Cloudinary deletion error:", error);
        // Don't throw - we want to continue even if deletion fails
        return { error: error.message };
    }
};
