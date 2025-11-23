import Report from "../models/reportModel.js";

export const createReport = async (req, res) => {
    try {
        const { tripId, reason } = req.body;
        const reporterId = req.user.userId; // Assuming auth middleware adds tokenData

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
            .populate("reportedTrip", "title")
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
};
