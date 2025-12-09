import { getAllTripsForAdmin } from "../services/adminService.js";

export async function getAdminTrips(req, res) {
    try {
        // Check if user is admin - use strict inequality and null check
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";

        const result = await getAllTripsForAdmin(page, limit, search);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching admin trips:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}