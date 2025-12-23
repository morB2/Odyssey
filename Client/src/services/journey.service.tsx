import api from './httpService';

/**
 * Get map markers for user's trips
 */
export async function getJourneyMapData(userId: string) {
    try {
        const response = await api.get(`/journey/map/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching map data:', error);
        throw error;
    }
}
