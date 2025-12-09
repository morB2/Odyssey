import {
    createCollectionService,
    getCollectionsByUserService,
    getCollectionByIdService,
    updateCollectionService,
    deleteCollectionService
} from "../services/collectionService.js";

export const createCollection = async (req, res) => {
    try {
        const userId = req.user.userId;
        const savedCollection = await createCollectionService(userId, req.body);

        res.status(201).json({ success: true, collection: savedCollection });
    } catch (error) {
        console.error("Error creating collection:", error);
        res.status(500).json({ success: false, error: "Failed to create collection" });
    }
};

export const getCollectionsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const viewerId = req.user ? req.user.userId : null;

        const collections = await getCollectionsByUserService(userId, viewerId);
        res.status(200).json({ success: true, collections });
    } catch (error) {
        console.error("Error getting collections:", error);
        res.status(500).json({ success: false, error: "Failed to fetch collections" });
    }
};

export const getCollectionById = async (req, res) => {
    try {
        const { id } = req.params;
        const viewerId = req.user ? req.user.userId : null;

        const collection = await getCollectionByIdService(id);

        if (!collection) return res.status(404).json({ success: false, error: "Collection not found" });

        // Privacy check
        if (collection.isPrivate) {
            const ownerId = collection.user._id.toString();
            if (!viewerId || ownerId !== viewerId.toString()) {
                return res.status(403).json({ success: false, error: "Access denied" });
            }
        }

        res.status(200).json({ success: true, collection });
    } catch (error) {
        console.error("Error getting collection:", error);
        res.status(500).json({ success: false, error: "Failed to fetch collection" });
    }
};

export const updateCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const updatedCollection = await updateCollectionService(id, userId, req.body);

        if (!updatedCollection) {
            return res.status(404).json({ success: false, error: "Collection not found or unauthorized" });
        }

        res.status(200).json({ success: true, collection: updatedCollection });
    } catch (error) {
        console.error("Error updating collection:", error);
        res.status(500).json({ success: false, error: "Failed to update collection" });
    }
};

export const deleteCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const deleted = await deleteCollectionService(id, userId);

        if (!deleted) {
            return res.status(404).json({ success: false, error: "Collection not found or unauthorized" });
        }

        res.status(200).json({ success: true, message: "Collection deleted" });
    } catch (error) {
        console.error("Error deleting collection:", error);
        res.status(500).json({ success: false, error: "Failed to delete collection" });
    }
};
