import {
    createReportService,
    getReportsService,
    updateReportStatusService,
    deleteReportedPostService
} from "../services/reportService.js";

// Create a new report
export const createReport = async (req, res) => {
    try {
        const { tripId, reason, userId } = req.body;

        if (!tripId || !reason) {
            return res.status(400).json({ error: "Trip ID and reason are required" });
        }

        const newReport = await createReportService({ tripId, reason, reporterId: userId });
        res.status(201).json(newReport);
    } catch (error) {
        if (error.message === "You have already reported this trip.") {
            return res.status(409).json({ error: error.message });
        }
        console.error("Error creating report:", error);
        res.status(500).json({ error: "Failed to create report" });
    }
};

// Get all reports
export const getReports = async (req, res) => {
    try {
        const reports = await getReportsService();
        res.json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
};

// Update report status
export const updateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status } = req.body;

        if (!["pending", "reviewed", "resolved"].includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        const report = await updateReportStatusService(reportId, status);

        if (!report) {
            return res.status(404).json({ error: "Report not found" });
        }

        res.json(report);
    } catch (error) {
        console.error("Error updating report status:", error);
        res.status(500).json({ error: "Failed to update report status" });
    }
};

// Delete a reported post
export const deleteReportedPost = async (req, res) => {
    try {
        const { tripId } = req.params;

        const deletedTrip = await deleteReportedPostService(tripId);

        if (!deletedTrip) {
            return res.status(404).json({ error: "Trip not found" });
        }

        res.json({ message: "Post deleted and reports resolved", tripId });
    } catch (error) {
        console.error("Error deleting reported post:", error);
        res.status(500).json({ error: "Failed to delete reported post" });
    }
};
