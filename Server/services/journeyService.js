import Trip from "../models/tripModel.js";

/**
 * Get map markers data for all user's trips
 * @param {string} userId - User ID
 * @param {boolean} isOwner - Whether the requesting user is the owner
 * @returns {Array} Array of map markers with coordinates and trip info
 */
export async function getMapData(userId, isOwner = true) {
    const filter = { user: userId };

    // If not owner, only show public trips
    if (!isOwner) {
        filter.visabilityStatus = 'public';
    }

    const trips = await Trip.find(filter).lean();

    const markers = [];

    trips.forEach(trip => {
        trip.optimizedRoute?.ordered_route?.forEach(stop => {
            if (stop.lat && stop.lon) {
                markers.push({
                    lat: stop.lat,
                    lon: stop.lon,
                    name: stop.name,
                    tripId: trip._id,
                    tripTitle: trip.title || 'Untitled Trip',
                    tripImage: trip.images?.[0] || null,
                    createdAt: trip.createdAt
                });
            }
        });
    });

    return markers;
}
