import { getMapData } from "../services/journeyService.js";

/**
 * Get map markers for user's trips
 */
export async function getJourneyMapData(req, res) {
    try {
        const userId = req.params.userId || req.user.userId;
        const requestingUserId = req.user.userId?.toString();
        const isOwner = userId?.toString() == requestingUserId || !requestingUserId;

        const markers = await getMapData(userId, isOwner);

        res.status(200).json({
            success: true,
            markers
        });
    } catch (error) {
        console.error("Error fetching map data:", error);
        res.status(500).json({ message: "Failed to get map data" });
    }
}
