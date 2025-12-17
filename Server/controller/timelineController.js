import { getUserTimeline, getMapData, getOnThisDay } from "../services/timelineService.js";
import User from "../models/userModel.js";

/**
 * Get user's timeline with trips, statistics, and grouped data
 */
export async function getTimeline(req, res) {
    try {
        const userId = req.params.userId || req.user.userId;
        const requestingUserId = req.user.userId?.toString();
        const isOwner = userId === requestingUserId;

        const timeline = await getUserTimeline(userId, isOwner);

        res.status(200).json({
            success: true,
            ...timeline
        });
    } catch (error) {
        console.error("Error fetching timeline:", error);
        res.status(500).json({ message: "Failed to get timeline" });
    }
}

/**
 * Get map markers for user's trips
 */
export async function getTimelineMapData(req, res) {
    try {
        const userId = req.params.userId || req.user.userId;
        const requestingUserId = req.user.userId?.toString();
        const isOwner = userId === requestingUserId;

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

/**
 * Get trips from this day in past years
 */
export async function getOnThisDayTrips(req, res) {
    try {
        const userId = req.user.userId;
        const today = new Date();
        const month = today.getMonth() + 1; // JavaScript months are 0-indexed
        const day = today.getDate();

        const trips = await getOnThisDay(userId, month, day);

        res.status(200).json({
            success: true,
            trips,
            date: { month, day }
        });
    } catch (error) {
        console.error("Error fetching On This Day trips:", error);
        res.status(500).json({ message: "Failed to get trips" });
    }
}
