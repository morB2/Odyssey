import redis from "../db/redisClient.js";
import Trip from "../models/tripModel.js";
import User from "../models/userModel.js";

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

        console.log('[Cache] Analytics cache cleared');
    } catch (error) {
        console.error('[Cache] Error clearing analytics cache:', error);
        throw error;
    }
}

