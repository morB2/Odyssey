import Trip from "../models/tripModel.js";
import User from "../models/userModel.js";

/**
 * Get all trips for admin with pagination and search
 * @param {number} page - page number
 * @param {number} limit - items per page
 * @param {string} search - search query (optional)
 */
export async function getAllTripsForAdmin(page = 1, limit = 10, search = "") {
    const skip = (page - 1) * limit;

    let filter = {};

    if (search && search.trim()) {
        const searchTerm = search.trim();
        const searchRegex = new RegExp(searchTerm, 'i');

        // First, find users that match the search term
        const matchingUsers = await User.find({
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex }
            ]
        }).select('_id').lean();

        const userIds = matchingUsers.map(user => user._id);

        // Use regex search for title (supports partial matching)
        // and regex for activities, plus user ID matching
        filter.$or = [
            { title: searchRegex }, // Regex search - supports partial matching
            { activities: { $in: [searchRegex] } },
            { user: { $in: userIds } }
        ];
    }

    // Execute queries in parallel
    const [trips, total] = await Promise.all([
        Trip.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: "user",
                select: "_id firstName lastName avatar",
            })
            .lean(),
        Trip.countDocuments(filter),
    ]);

    return {
        trips,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
}