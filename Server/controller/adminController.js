import { getAllTripsForAdmin } from "../services/adminService.js";
import {
    getTopViewedPosts,
    getTopLikedPosts,
    // getViewsTrend,
    getCategoryDistribution,
    getTopActiveUsers,
    getTopReportedPosts,
    getTopReportedUsers,
    getTopReporters,
    getReportReasonDistribution,
    getReportsTrend
} from "../services/adminStatsService.js";

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

// Statistics endpoints
export async function getTopViewedPostsController(req, res) {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const posts = await getTopViewedPosts();
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching top viewed posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getTopLikedPostsController(req, res) {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const posts = await getTopLikedPosts();
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching top liked posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getCategoryDistributionController(req, res) {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const distribution = await getCategoryDistribution();
        res.status(200).json(distribution);
    } catch (error) {
        console.error("Error fetching category distribution:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export async function getTopActiveUsersController(req, res) {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const users = await getTopActiveUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching top active users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Report statistics endpoints
export async function getTopReportedPostsController(req, res) {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const posts = await getTopReportedPosts();
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching top reported posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getTopReportedUsersController(req, res) {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const users = await getTopReportedUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching top reported users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getTopReportersController(req, res) {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const users = await getTopReporters();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching top reporters:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getReportReasonDistributionController(req, res) {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const distribution = await getReportReasonDistribution();
        res.status(200).json(distribution);
    } catch (error) {
        console.error("Error fetching report reason distribution:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getReportsTrendController(req, res) {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const days = parseInt(req.query.days) || 30;
        const trend = await getReportsTrend(days);
        res.status(200).json(trend);
    } catch (error) {
        console.error("Error fetching reports trend:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}