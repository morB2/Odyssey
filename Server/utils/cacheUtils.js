import redis from "../db/redisClient.js";

export async function clearUserFeedCache(userId) {
    const pattern = `feed:${userId}:*`;
    console.log('Pattern:', pattern);

    let cursor = '0'; // String, not number!

    try {
        do {
            const result = await redis.scan(cursor, {
                MATCH: pattern,
                COUNT: 100
            });

            console.log('Result:', result);

            cursor = result.cursor; // This will be a string
            console.log('Next cursor:', cursor);

            if (result.keys.length > 0) {
                console.log('Deleting keys:', result.keys);
                await redis.del(...result.keys);
            }

        } while (cursor !== '0'); // Compare to string '0'

        console.log('Scan complete');
    } catch (error) {
        console.error('Error during scan:', error);
        throw error;
    }
}

export async function clearUserProfileCache(userId) {
    const pattern = `profile:${userId}:*`;
    console.log('[Cache] Clearing profile cache for user:', userId);

    let cursor = '0';

    try {
        do {
            const result = await redis.scan(cursor, {
                MATCH: pattern,
                COUNT: 100
            });

            cursor = result.cursor;

            if (result.keys.length > 0) {
                console.log('[Cache] Deleting profile cache keys:', result.keys);
                await redis.del(...result.keys);
            }

        } while (cursor !== '0');

        console.log('[Cache] Profile cache cleared for user:', userId);
    } catch (error) {
        console.error('[Cache] Error clearing profile cache:', error);
        throw error;
    }
}

export async function clearUserLikedCache(userId) {
    const cacheKey = `liked:${userId}`;
    console.log('[Cache] Clearing liked cache for user:', userId);

    try {
        await redis.del(cacheKey);
        console.log('[Cache] Liked cache cleared for user:', userId);
    } catch (error) {
        console.error('[Cache] Error clearing liked cache:', error);
        throw error;
    }
}

export async function clearUserSavedCache(userId) {
    const cacheKey = `saved:${userId}`;
    console.log('[Cache] Clearing saved cache for user:', userId);

    try {
        await redis.del(cacheKey);
        console.log('[Cache] Saved cache cleared for user:', userId);
    } catch (error) {
        console.error('[Cache] Error clearing saved cache:', error);
        throw error;
    }
}