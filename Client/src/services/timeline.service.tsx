import api from './httpService';

/**
 * Get user's timeline data (trips, stats, grouped)
 */
export async function getTimeline(userId: string) {
    try {
        const response = await api.get(`/timeline/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching timeline:', error);
        throw error;
    }
}

/**
 * Get map markers for user's trips
 */
export async function getTimelineMapData(userId: string) {
    try {
        const response = await api.get(`/timeline/map/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching map data:', error);
        throw error;
    }
}

/**
 * Get trips from this day in past years
 */
export async function getOnThisDayTrips() {
    try {
        const response = await api.get('/timeline/onthisday');
        return response.data;
    } catch (error) {
        console.error('Error fetching on this day trips:', error);
        throw error;
    }
}
