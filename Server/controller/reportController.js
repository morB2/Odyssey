import Report from "../models/reportModel.js";
import Trip from "../models/tripModel.js";

export const createReport = async (req, res) => {
    try {
        const { tripId, reason, userId } = req.body;
        const reporterId = userId;

        if (!tripId || !reason) {
            return res.status(400).json({ error: "Trip ID and reason are required" });
        }

        const newReport = new Report({
            reporter: reporterId,
            reportedTrip: tripId,
            reason,
        });

        await newReport.save();
        res.status(201).json(newReport);
    } catch (error) {
        console.error("Error creating report:", error);
        res.status(500).json({ error: "Failed to create report" });
    }
};

export const getReports = async (req, res) => {
    try {
        // In a real app, you might want to check for admin role here
        const reports = await Report.find()
            .populate("reporter", "firstName lastName email")
            .populate({
                path: "reportedTrip",
                select: "title description images activities notes optimizedRoute user createdAt",
                populate: {
                    path: "user",
                    select: "firstName lastName username"
                }
            })
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
};

export const updateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status } = req.body;

        if (!["pending", "reviewed", "resolved"].includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        const report = await Report.findByIdAndUpdate(
            reportId,
            { status },
            { new: true }
        )
            .populate("reporter", "firstName lastName email")
            .populate("reportedTrip", "title");

        if (!report) {
            return res.status(404).json({ error: "Report not found" });
        }

        res.json(report);
    } catch (error) {
        console.error("Error updating report status:", error);
        res.status(500).json({ error: "Failed to update report status" });
    }
};

export const deleteReportedPost = async (req, res) => {
    try {
        const { tripId } = req.params;

        // Delete the trip
        const deletedTrip = await Trip.findByIdAndDelete(tripId);

        if (!deletedTrip) {
            return res.status(404).json({ error: "Trip not found" });
        }

        // Update all reports for this trip to "resolved"
        await Report.updateMany(
            { reportedTrip: tripId },
            { status: "resolved" }
        );

        res.json({ message: "Post deleted and reports resolved", tripId });
    } catch (error) {
        console.error("Error deleting reported post:", error);
        res.status(500).json({ error: "Failed to delete reported post" });
    }
};
