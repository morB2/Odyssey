import Report from "../models/reportModel.js";
import Trip from "../models/tripModel.js";

// Service to create a report
export const createReportService = async ({ tripId, reason, reporterId }) => {
    // Check if the user already reported this trip
    const existingReport = await Report.findOne({
        reporter: reporterId,
        reportedTrip: tripId
    });

    if (existingReport) {
        // Return null or throw an error to indicate the duplicate
        throw new Error("You have already reported this trip.");
    }

    // Create a new report
    const newReport = new Report({
        reporter: reporterId,
        reportedTrip: tripId,
        reason,
    });

    return await newReport.save();
};

// Service to get all reports
export const getReportsService = async () => {
    return await Report.find()
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
};

// Service to update report status
export const updateReportStatusService = async (reportId, status) => {
    return await Report.findByIdAndUpdate(
        reportId,
        { status },
        { new: true }
    )
        .populate("reporter", "firstName lastName email")
        .populate("reportedTrip", "title");
};

// Service to delete a reported trip and update reports
export const deleteReportedPostService = async (tripId) => {
    const deletedTrip = await Trip.findByIdAndDelete(tripId);

    if (!deletedTrip) return null;

    await Report.updateMany(
        { reportedTrip: tripId },
        { status: "resolved" }
    );

    return deletedTrip;
};
