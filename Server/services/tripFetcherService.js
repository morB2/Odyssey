import Trip from "../models/tripModel.js";
import Like from "../models/likesModel.js";
import Save from "../models/savesModel.js";
import Follow from "../models/followModel.js";
import User from "../models/userModel.js";
import redis from "../db/redisClient.js";

const SERVER_URL =
  process.env.SERVER_URL || "https://odyssey-dbdn.onrender.com";

// -----------------------------------------------------
// Helper Functions
// -----------------------------------------------------

/**
 * Normalize avatar URL to include server URL if needed
 */
export function normalizeAvatarUrl(url) {
  if (!url) return url;
  if (typeof url !== "string") return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${SERVER_URL}${url}`;
  return url;
}

/**
 * Calculate personalized score for feed ranking
 */
function calculatePersonalizedScore({
  trip,
  user,
  followingIds,
  likeCount,
  saveCount,
  commentCount,
}) {
  let score = 0;
  const hoursOld = (Date.now() - new Date(trip.createdAt)) / 36e5;

  // Recency bonus (max 40 points for new posts)
  score += Math.max(0, 40 - hoursOld);
  //views bonus
  score += Math.log10((trip.views || 0) + 1) * 10;
  // Engagement metrics
  score += likeCount * 3 + commentCount * 5 + saveCount * 8;

  if (user) {
    const creatorId = trip.user._id.toString();
    const isFollowed = followingIds.includes(creatorId);
    const isCreator = creatorId === user._id.toString();

    // Following bonus
    if (isFollowed) score += 40;

    // Discovery bonus (not following, not own post)
    if (!isFollowed && !isCreator) score += 15;

    // Shared interests bonus
    const sharedActivities = (trip.activities || []).filter((a) =>
      user.preferences?.includes(a)
    );
    score += sharedActivities.length * 5;

    // Own post bonus
    if (isCreator) score += 5;
  }

  // Old post penalty
  if (hoursOld > 96) score -= 20;

  // Random factor for variety
  score += Math.random() * 2;

  return score;
}

/**
 * Apply diversity filter to avoid consecutive posts from same creator
 */
function applyDiversityFilter(trips) {
  const creatorMap = new Map();
  const result = [];

  for (let trip of trips) {
    const creatorId = trip.user._id.toString();
    const lastIndex = creatorMap.get(creatorId) || -Infinity;
    // Optional: uncomment to enforce spacing
    // if (result.length - lastIndex <= 1) continue;

    result.push(trip);
    creatorMap.set(creatorId, result.length - 1);
  }

  return result;
}

/**
 * Build metadata for trips (likes, saves, follows)
 */
async function buildTripMetadata({ trips, viewerId }) {
  if (!trips.length) {
    return {
      likedSet: new Set(),
      savedSet: new Set(),
      followSet: new Set(),
      likeMap: {},
      saveMap: {},
    };
  }

  const tripIds = trips.map((t) => t._id);
  const authorIds = [
    ...new Set(trips.map((t) => String(t.user?._id)).filter(Boolean)),
  ];

  // Fetch viewer-specific data if viewerId provided
  let likedSet = new Set();
  let savedSet = new Set();
  let followSet = new Set();

  if (viewerId) {
    const [liked, saved, follows] = await Promise.all([
      Like.find({ user: viewerId, trip: { $in: tripIds } }).select("trip"),
      Save.find({ user: viewerId, trip: { $in: tripIds } }).select("trip"),
      Follow.find({
        follower: viewerId,
        following: { $in: authorIds },
      }).select("following"),
    ]);

    likedSet = new Set(liked.map((l) => String(l.trip)));
    savedSet = new Set(saved.map((s) => String(s.trip)));
    followSet = new Set(follows.map((f) => String(f.following)));
  }

  // Fetch aggregate counts (for all trips)
  const [likeCounts, saveCounts] = await Promise.all([
    Like.aggregate([
      { $match: { trip: { $in: tripIds } } },
      { $group: { _id: "$trip", count: { $sum: 1 } } },
    ]),
    Save.aggregate([
      { $match: { trip: { $in: tripIds } } },
      { $group: { _id: "$trip", count: { $sum: 1 } } },
    ]),
  ]);

  const likeMap = Object.fromEntries(
    likeCounts.map((l) => [l._id.toString(), l.count])
  );
  const saveMap = Object.fromEntries(
    saveCounts.map((s) => [s._id.toString(), s.count])
  );

  return { likedSet, savedSet, followSet, likeMap, saveMap };
}

/**
 * Enrich a single trip with metadata and process comments
 */
function enrichTrip(trip, metadata, viewerId, processComments = true) {
  const { likedSet, savedSet, followSet, likeMap, saveMap } = metadata;
  const tripId = String(trip._id);

  // Process comments with reaction aggregation
  let processedComments = trip.comments || [];
  if (processComments && Array.isArray(processedComments)) {
    processedComments = processedComments.map((comment) => {
      // Aggregate reactions by emoji
      const reactionsAggregated = {};
      if (comment.reactions && comment.reactions.length > 0) {
        comment.reactions.forEach((reaction) => {
          reactionsAggregated[reaction.emoji] =
            (reactionsAggregated[reaction.emoji] || 0) + 1;
        });
      }

      // Normalize comment user (include name & username) and avatar
      const commentUser = comment.user
        ? {
            _id: comment.user._id?.toString(),
            firstName: comment.user.firstName,
            lastName: comment.user.lastName,
            name: `${(comment.user.firstName || "").trim()} ${(
              comment.user.lastName || ""
            ).trim()}`.trim(),
            username:
              (comment.user.firstName || "")
                .toString()
                .replace(/\s+/g, "")
                .toLowerCase() || comment.user._id?.toString(),
            avatar: normalizeAvatarUrl(comment.user.avatar),
          }
        : null;

      // Process and normalize replies
      const replies = (comment.replies || []).map((reply) => {
        const replyUser = reply.user
          ? {
              _id: reply.user._id?.toString(),
              firstName: reply.user.firstName,
              lastName: reply.user.lastName,
              name: `${(reply.user.firstName || "").trim()} ${(
                reply.user.lastName || ""
              ).trim()}`.trim(),
              username:
                (reply.user.firstName || "")
                  .toString()
                  .replace(/\s+/g, "")
                  .toLowerCase() || reply.user._id?.toString(),
              avatar: normalizeAvatarUrl(reply.user.avatar),
            }
          : null;

        return {
          id: reply._id?.toString(),
          text: reply.comment ?? reply.text ?? "",
          timestamp: reply.createdAt ?? reply.timestamp ?? null,
          userId: reply.user?._id?.toString(),
          user: replyUser,
        };
      });

      // Normalize comment shape for client
      const commentId = comment._id?.toString();
      const normalizedComment = {
        id: commentId,
        text: comment.comment ?? comment.text ?? "",
        timestamp: comment.createdAt ?? comment.timestamp ?? null,
        userId: comment.user?._id?.toString(),
        user: commentUser,
        reactionsAggregated,
        replies,
      };

      return normalizedComment;
    });
  }

  return {
    ...trip,
    likes: likeMap[tripId] || trip.likes || 0,
    saves: saveMap[tripId] || trip.saves || 0,
    isLiked: viewerId ? likedSet.has(tripId) : false,
    isSaved: viewerId ? savedSet.has(tripId) : false,
    user: trip.user
      ? {
          ...trip.user,
          avatar: normalizeAvatarUrl(trip.user.avatar),
          isFollowing: viewerId ? followSet.has(String(trip.user._id)) : false,
        }
      : trip.user,
    comments: processedComments,
  };
}

// -----------------------------------------------------
// Main Unified Fetch Function
// -----------------------------------------------------

/**
 * Unified trip fetching function with configurable options
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.filter - MongoDB filter object
 * @param {string} options.viewerId - Current user ID for metadata
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.limit - Items per page
 * @param {number} options.skip - Override calculated skip
 * @param {Object} options.sort - MongoDB sort object
 * @param {boolean} options.enableScoring - Enable personalized scoring
 * @param {boolean} options.enableDiversity - Apply diversity filter
 * @param {number} options.scoringWindow - Max trips to fetch for scoring (default: 1000)
 * @param {boolean} options.populateUser - Populate user field
 * @param {boolean} options.populateComments - Populate comment users
 * @param {boolean} options.populateReplies - Populate reply users
 * @param {string} options.cacheKey - Redis cache key
 * @param {number} options.cacheTTL - Cache TTL in seconds
 * @param {boolean} options.includeMetadata - Include pagination metadata
 * @param {boolean} options.processComments - Process comments with reactions
 * @returns {Promise<Array|Object>} Enriched trips or object with trips and pagination
 */
export async function fetchTrips({
  filter = {},
  viewerId = null,
  page = 1,
  limit = 20,
  skip = null,
  sort = { createdAt: -1 },
  excludeSeen = false, //hard filter
  softRepeat = false,
  enableScoring = false,
  enableDiversity = false,
  scoringWindow = 1000, // Limit trips fetched for scoring to prevent memory issues
  populateUser = true,
  populateComments = true,
  populateReplies = true,
  cacheKey = null,
  cacheTTL = 60,
  includeMetadata = false,
  processComments = true,
}) {
  // Check cache first
  if (cacheKey) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  // Calculate skip for pagination
  const calculatedSkip = skip !== null ? skip : (page - 1) * limit;

  // Build population array
  const populate = [];
  if (populateUser) {
    populate.push({
      path: "user",
      select: "_id firstName lastName avatar",
    });
  }
  if (populateComments) {
    populate.push({
      path: "comments.user",
      select: "_id firstName lastName avatar",
    });
  }
  if (populateReplies) {
    populate.push({
      path: "comments.replies.user",
      select: "_id firstName lastName avatar",
    });
  }

  // Fetch trips from database
  let query = Trip.find(filter).sort(sort);

  // Apply population
  populate.forEach((pop) => {
    query = query.populate(pop);
  });

  // For scoring/diversity, we need all trips before pagination
  let trips;
  let total = 0;

  // ------------------------------------
  // Load seen trips only if requested
  // ------------------------------------
  let seenSet = new Set();

  if (viewerId && (excludeSeen || softRepeat)) {
    const seenTripIds = await redis.sMembers(`user:${viewerId}:seenTrips`);
    seenSet = new Set(seenTripIds);
  }

  if (enableScoring || enableDiversity) {
    // Fetch trips up to scoringWindow limit for performance
    // This prevents loading thousands of trips into memory for scoring
    trips = await query.limit(scoringWindow).lean();
    if (excludeSeen && viewerId && seenSet.size > 0) {
      trips = trips.filter((trip) => !seenSet.has(trip._id.toString()));
    }
    total = trips.length;

    // Build metadata for scoring
    const metadata = await buildTripMetadata({ trips, viewerId });

    // Enrich trips
    let enrichedTrips = trips.map((trip) =>
      enrichTrip(trip, metadata, viewerId, processComments)
    );

    // Apply scoring if enabled
    if (enableScoring && viewerId) {
      const user = await User.findById(viewerId).lean();
      const followingDocs = await Follow.find({ follower: viewerId }).select(
        "following"
      );
      const followingIds = followingDocs.map((f) => f.following.toString());
      enrichedTrips = enrichedTrips.map((trip) => {
        let score = calculatePersonalizedScore({
          trip,
          user,
          followingIds,
          likeCount: metadata.likeMap[trip._id] || 0,
          saveCount: metadata.saveMap[trip._id] || 0,
          commentCount: trip.comments?.length || 0,
        });

        const tripId = trip._id.toString();

        // ---------------------------------
        // SOFT REPEAT PENALTY ✅
        // ---------------------------------
        console.log("Soft repeat flag:", softRepeat, seenSet, tripId);
        if (softRepeat && seenSet.has(tripId)) {
          console.log("Applying soft repeat penalty for trip:", tripId);
          score *= 0.1; // 90% visibility drop
        }

        return {
          ...trip,
          score,
          seenBefore: seenSet.has(tripId), // optional for frontend
        };
      });

      // Sort by score
      enrichedTrips.sort((a, b) => b.score - a.score);
    }

    // Apply diversity filter if enabled
    if (enableDiversity) {
      enrichedTrips = applyDiversityFilter(enrichedTrips);
    }

    // Apply pagination after scoring/filtering
    trips = enrichedTrips.slice(calculatedSkip, calculatedSkip + limit);
  } else {
    // Standard pagination at query level
    if (includeMetadata) {
      total = await Trip.countDocuments(filter);
    }

    trips = await query.skip(calculatedSkip).limit(limit).lean();

    // Build metadata and enrich
    const metadata = await buildTripMetadata({ trips, viewerId });
    trips = trips.map((trip) =>
      enrichTrip(trip, metadata, viewerId, processComments)
    );
  }

  // Prepare response
  let response;
  if (includeMetadata) {
    response = {
      trips,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: calculatedSkip + trips.length < total,
      },
    };
  } else {
    response = trips;
  }

  // Cache result
  if (cacheKey) {
    await redis.setEx(cacheKey, cacheTTL, JSON.stringify(response));
  }

  return response;
}
