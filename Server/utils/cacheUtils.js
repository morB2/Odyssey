import redis from "../db/redisClient.js";

export async function clearUserFeedCache(userId) {
    const pattern = `feed:${userId}:*`;

    let cursor = '0'; // String, not number!

    try {
        do {
            const result = await redis.scan(cursor, {
                MATCH: pattern,
                COUNT: 100
            });

            cursor = result.cursor; // This will be a string

            if (result.keys.length > 0) {
                await redis.del(...result.keys);
            }

        } while (cursor !== '0'); // Compare to string '0'

    } catch (error) {
        console.error('Error during scan:', error);
        throw error;
    }
}

export async function clearUserProfileCache(userId) {
    const pattern = `profile:${userId}:*`;
    ('[Cache] Clearing profile cache for user:', userId);

    let cursor = '0';

    try {
        do {
            const result = await redis.scan(cursor, {
                MATCH: pattern,
                COUNT: 100
            });

            cursor = result.cursor;

            if (result.keys.length > 0) {
                ('[Cache] Deleting profile cache keys:', result.keys);
                await redis.del(...result.keys);
            }

        } while (cursor !== '0');

        ('[Cache] Profile cache cleared for user:', userId);
    } catch (error) {
        console.error('[Cache] Error clearing profile cache:', error);
        throw error;
    }
}

export async function clearUserLikedCache(userId) {
    const cacheKey = `liked:${userId}`;
    ('[Cache] Clearing liked cache for user:', userId);

    try {
        await redis.del(cacheKey);
        ('[Cache] Liked cache cleared for user:', userId);
    } catch (error) {
        console.error('[Cache] Error clearing liked cache:', error);
        throw error;
    }
}

export async function clearUserSavedCache(userId) {
    const cacheKey = `saved:${userId}`;
    ('[Cache] Clearing saved cache for user:', userId);

    try {
        await redis.del(cacheKey);
        ('[Cache] Saved cache cleared for user:', userId);
    } catch (error) {
        console.error('[Cache] Error clearing saved cache:', error);
        throw error;
    }
}