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