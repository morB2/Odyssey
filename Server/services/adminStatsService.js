import redis from "../db/redisClient.js";
import Trip from "../models/tripModel.js";
import User from "../models/userModel.js";
import Report from "../models/reportModel.js";

const ANALYTICS_CACHE_TTL = 300; // 5 minutes in seconds

/**
 * Get top 5 most viewed posts (with caching)
 */
export async function getTopViewedPosts() {
    const cacheKey = 'analytics:top-viewed';

    try {
        // Try to get from cache
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (error) {
        console.error('[Cache] Error reading top viewed posts cache:', error);
    }

    // If not in cache, fetch from DB
    const posts = await Trip.aggregate([
        {
            $match: {
                visabilityStatus: "public" // Only public posts
            }
        },
        {
            $sort: { views: -1 }
        },
        {
            $limit: 5
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        {
            $unwind: "$userInfo"
        },
        {
            $project: {
                _id: 1,
                title: 1,
                views: 1,
                likes: 1,
                userName: {
                    $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"]
                }
            }
        }
    ]);

    // Save to cache
    try {
        await redis.setEx(cacheKey, ANALYTICS_CACHE_TTL, JSON.stringify(posts));
    } catch (error) {
        console.error('[Cache] Error saving top viewed posts cache:', error);
    }

    return posts;
}

/**
 * Get top 5 most liked posts (with caching)
 */
export async function getTopLikedPosts() {
    const cacheKey = 'analytics:top-liked';

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (error) {
        console.error('[Cache] Error reading top liked posts cache:', error);
    }

    const posts = await Trip.aggregate([
        {
            $match: {
                visabilityStatus: "public"
            }
        },
        {
            $sort: { likes: -1 }
        },
        {
            $limit: 5
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        {
            $unwind: "$userInfo"
        },
        {
            $project: {
                _id: 1,
                title: 1,
                likes: 1,
                views: 1,
                userName: {
                    $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"]
                }
            }
        }
    ]);

    try {
        await redis.setEx(cacheKey, ANALYTICS_CACHE_TTL, JSON.stringify(posts));
    } catch (error) {
        console.error('[Cache] Error saving top liked posts cache:', error);
    }

    return posts;
}

/**
 * Get views trend for the last N days (with caching)
 * Note: Without view history tracking, this shows posts created per day
 * and fills in missing days with zero values for complete 30-day view
 */
// export async function getViewsTrend(days = 30) {
//     const cacheKey = `analytics:views-trend:${days}`;

//     try {
//         const cached = await redis.get(cacheKey);
//         if (cached) {
//             return JSON.parse(cached);
//         }
//     } catch (error) {
//         console.error('[Cache] Error reading views trend cache:', error);
//     }

//     // Calculate date range - go back 'days' from today
//     const endDate = new Date();
//     endDate.setHours(23, 59, 59, 999); // End of today

//     const startDate = new Date();
//     startDate.setDate(startDate.getDate() - days);
//     startDate.setHours(0, 0, 0, 0); // Start of the first day

//     // Get aggregated data for posts created in the date range
//     const aggregatedData = await Trip.aggregate([
//         {
//             $match: {
//                 createdAt: { $gte: startDate, $lte: endDate }
//             }
//         },
//         {
//             $group: {
//                 _id: {
//                     $dateToString: {
//                         format: "%Y-%m-%d",
//                         date: "$createdAt"
//                     }
//                 },
//                 totalViews: { $sum: "$views" },
//                 postsCount: { $sum: 1 }
//             }
//         },
//         {
//             $sort: { _id: 1 }
//         }
//     ]);

//     // Create a map of the aggregated data
//     const dataMap = new Map();
//     aggregatedData.forEach(item => {
//         dataMap.set(item._id, {
//             views: item.totalViews,
//             posts: item.postsCount
//         });
//     });

//     // Generate data for ALL days in the range (fill missing days with zeros)
//     const trend = [];
//     const currentDate = new Date(startDate);

//     while (currentDate <= endDate) {
//         const dateStr = currentDate.toISOString().split('T')[0];
//         const dayData = dataMap.get(dateStr);

//         trend.push({
//             date: dateStr,
//             views: dayData ? dayData.views : 0,
//             posts: dayData ? dayData.posts : 0
//         });

//         currentDate.setDate(currentDate.getDate() + 1);
//     }

//     try {
//         await redis.setEx(cacheKey, ANALYTICS_CACHE_TTL, JSON.stringify(trend));
//     } catch (error) {
//         console.error('[Cache] Error saving views trend cache:', error);
//     }

//     return trend;
// }

/**
 * Get posts distribution by categories (with caching)
 */
export async function getCategoryDistribution() {
    const cacheKey = 'analytics:category-distribution';

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (error) {
        console.error('[Cache] Error reading category distribution cache:', error);
    }

    const distribution = await Trip.aggregate([
        {
            $match: {
                activities: { $exists: true, $ne: [] }
            }
        },
        {
            $unwind: "$activities"
        },
        {
            $group: {
                _id: "$activities",
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $limit: 10 // Top 10 categories
        },
        {
            $project: {
                _id: 0,
                category: "$_id",
                count: 1
            }
        }
    ]);

    try {
        await redis.setEx(cacheKey, ANALYTICS_CACHE_TTL, JSON.stringify(distribution));
    } catch (error) {
        console.error('[Cache] Error saving category distribution cache:', error);
    }

    return distribution;
}

/*******************************
 *        User Stats           *
 *******************************/

/**
 * Get top active users for a given month (default: last month)
 * Score = posts + views + likes + comments + replies
 */
export async function getTopActiveUsers(year, month) {
    // -----------------------------
    // Default → current month
    // -----------------------------
    const today = new Date();

    if (!year || !month) {
        // Get current year and month
        year = today.getFullYear();
        month = today.getMonth() + 1; // getMonth() returns 0-11, so add 1
    }

    // Create start and end dates for the specified month
    const start = new Date(year, month - 2, 1); // First day of month
    const end = new Date(year, month, 1); // First day of next month

    const cacheKey = `analytics:top-active-users:${year}-${month}`;

    // -----------------------------
    // Cache read
    // -----------------------------
    try {
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);
    } catch (err) {
        console.error("[Cache] Error reading:", err);
    }

    // -----------------------------
    // Aggregation
    // -----------------------------
    const results = await Trip.aggregate([
        {
            $match: {
                createdAt: { $gte: start, $lt: end },
                visabilityStatus: "public"
            }
        },

        // Count comments AND replies for each trip
        {
            $addFields: {
                commentsCount: { $size: { $ifNull: ["$comments", []] } },

                repliesCount: {
                    $sum: {
                        $map: {
                            input: { $ifNull: ["$comments", []] },
                            as: "c",
                            in: {
                                $size: { $ifNull: ["$$c.replies", []] }
                            }
                        }
                    }
                }
            }
        },

        {
            $group: {
                _id: "$user",
                postsCount: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: "$likes" },
                totalComments: { $sum: "$commentsCount" },
                totalReplies: { $sum: "$repliesCount" }
            }
        },

        {
            $addFields: {
                activityScore: {
                    $add: [
                        { $multiply: ["$postsCount", 3] },
                        { $multiply: ["$totalViews", 0.1] },
                        { $multiply: ["$totalLikes", 1] },
                        { $multiply: ["$totalComments", 2] },
                        { $multiply: ["$totalReplies", 1] }
                    ]
                }
            }
        },

        { $sort: { activityScore: -1 } },
        { $limit: 3 },

        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        },

        { $unwind: "$user" },

        {
            $project: {
                _id: "$user._id",
                firstName: "$user.firstName",
                lastName: "$user.lastName",
                postsCount: 1,
                totalViews: 1,
                totalLikes: 1,
                totalComments: 1,
                totalReplies: 1,
                activityScore: 1
            }
        }
    ]);

    // -----------------------------
    // Cache write
    // -----------------------------
    try {
        // await redis.setEx(cacheKey, ANALYTICS_CACHE_TTL, JSON.stringify(results));
    } catch (err) {
        console.error("[Cache] Error saving:", err);
    }

    return results;
}


/*******************************
 *        Report Stats         *
 *******************************/

/**
 * Get top 5 posts with the most reports
 */
export async function getTopReportedPosts() {
    const cacheKey = 'analytics:top-reported-posts';

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (error) {
        console.error('[Cache] Error reading top reported posts cache:', error);
    }

    // Aggregate reports by the reported trip
    const results = await Report.aggregate([
        {
            $group: {
                _id: "$reportedTrip",
                reportCount: { $sum: 1 }
            }
        },
        {
            $sort: { reportCount: -1 }
        },
        {
            $limit: 5
        },
        {
            $lookup: {
                from: "trips",
                localField: "_id",
                foreignField: "_id",
                as: "tripInfo"
            }
        },
        {
            $unwind: {
                path: "$tripInfo",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "tripInfo.user",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        {
            $unwind: {
                path: "$userInfo",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: "$tripInfo._id",
                title: "$tripInfo.title",
                author: {
                    $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"]
                },
                views: "$tripInfo.views",
                likes: "$tripInfo.likes",
                reportCount: 1,
                createdAt: "$tripInfo.createdAt"
            }
        }
    ]);

    try {
        await redis.setEx(cacheKey, ANALYTICS_CACHE_TTL, JSON.stringify(results));
    } catch (error) {
        console.error('[Cache] Error saving top reported posts cache:', error);
    }

    return results;
}

/**
 * Get top 5 users who were reported the most
 */
export async function getTopReportedUsers() {
    const cacheKey = 'analytics:top-reported-users';

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (error) {
        console.error('[Cache] Error reading top reported users cache:', error);
    }

    // Aggregate reports by the user who owns the reported trip
    const results = await Report.aggregate([
        {
            $lookup: {
                from: "trips",
                localField: "reportedTrip",
                foreignField: "_id",
                as: "tripInfo"
            }
        },
        {
            $unwind: "$tripInfo"
        },
        {
            $group: {
                _id: "$tripInfo.user",
                reportCount: { $sum: 1 }
            }
        },
        {
            $sort: { reportCount: -1 }
        },
        {
            $limit: 5
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        {
            $unwind: "$userInfo"
        },
        {
            $project: {
                _id: "$userInfo._id",
                firstName: "$userInfo.firstName",
                lastName: "$userInfo.lastName",
                email: "$userInfo.email",
                reportCount: 1
            }
        }
    ]);

    try {
        await redis.setEx(cacheKey, ANALYTICS_CACHE_TTL, JSON.stringify(results));
    } catch (error) {
        console.error('[Cache] Error saving top reported users cache:', error);
    }

    return results;
}

/**
 * Get top 5 users who report the most
 */
export async function getTopReporters() {
    const cacheKey = 'analytics:top-reporters';

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (error) {
        console.error('[Cache] Error reading top reporters cache:', error);
    }

    const results = await Report.aggregate([
        {
            $group: {
                _id: "$reporter",
                reportCount: { $sum: 1 }
            }
        },
        {
            $sort: { reportCount: -1 }
        },
        {
            $limit: 5
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        {
            $unwind: "$userInfo"
        },
        {
            $project: {
                _id: "$userInfo._id",
                firstName: "$userInfo.firstName",
                lastName: "$userInfo.lastName",
                email: "$userInfo.email",
                reportCount: 1
            }
        }
    ]);

    try {
        await redis.setEx(cacheKey, ANALYTICS_CACHE_TTL, JSON.stringify(results));
    } catch (error) {
        console.error('[Cache] Error saving top reporters cache:', error);
    }

    return results;
}

/**
 * Get report reason distribution
 */
export async function getReportReasonDistribution() {
    const cacheKey = 'analytics:report-reason-distribution';

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (error) {
        console.error('[Cache] Error reading report reason distribution cache:', error);
    }

    const distribution = await Report.aggregate([
        {
            $group: {
                _id: "$reason",
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $project: {
                _id: 0,
                reason: "$_id",
                count: 1
            }
        }
    ]);

    try {
        await redis.setEx(cacheKey, ANALYTICS_CACHE_TTL, JSON.stringify(distribution));
    } catch (error) {
        console.error('[Cache] Error saving report reason distribution cache:', error);
    }

    return distribution;
}

/**
 * Get reports trend for the last N days (with caching)
 */
export async function getReportsTrend(days = 30) {
    const cacheKey = `analytics:reports-trend:${days}`;

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (error) {
        console.error('[Cache] Error reading reports trend cache:', error);
    }

    // Calculate date range - include today
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // End of today

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1)); // Go back days-1 to include today
    startDate.setHours(0, 0, 0, 0); // Start of the first day

    // Get aggregated data for reports created in the date range
    const aggregatedData = await Report.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt"
                    }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    // Create a map of the aggregated data
    const dataMap = new Map();
    aggregatedData.forEach(item => {
        dataMap.set(item._id, item.count);
    });

    // Generate data for ALL days in the range (fill missing days with zeros)
    const trend = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = dataMap.get(dateStr) || 0;

        trend.push({
            date: dateStr,
            count: count
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    try {
        await redis.setEx(cacheKey, ANALYTICS_CACHE_TTL, JSON.stringify(trend));
    } catch (error) {
        console.error('[Cache] Error saving reports trend cache:', error);
    }

    return trend;
}


/*******************************
 *        Cache                *
 *******************************/

// Clear all analytics cache
export async function clearAnalyticsCache() {
    const pattern = 'analytics:*';
    let cursor = '0';

    try {
        do {
            const result = await redis.scan(cursor, {
                MATCH: pattern,
                COUNT: 100
            });

            cursor = result.cursor;

            if (result.keys.length > 0) {
                await redis.del(...result.keys);
            }

        } while (cursor !== '0');

    } catch (error) {
        console.error('[Cache] Error clearing analytics cache:', error);
        throw error;
    }
}

