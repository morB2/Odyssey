import Trip from "../models/tripModel.js";

/**
 * Get user's timeline with trips grouped by year and month
 * @param {string} userId - User ID
 * @param {boolean} isOwner - Whether the requesting user is the owner
 * @returns {Object} Timeline data with trips, grouped data, and statistics
 */
export async function getUserTimeline(userId, isOwner = true) {
    // Build query filter
    const filter = { user: userId };

    // If not owner, only show public trips
    if (!isOwner) {
        filter.visabilityStatus = 'public';
    }

    const trips = await Trip.find(filter)
        .sort({ createdAt: -1 })
        .populate('user', 'firstName lastName avatar')
        .lean();

    const grouped = groupTripsByDate(trips);
    const stats = calculateStats(trips);

    return {
        trips,
        grouped,
        stats
    };
}

/**
 * Group trips by year and month
 * @param {Array} trips - Array of trip objects
 * @returns {Object} Trips grouped by year and month
 */
function groupTripsByDate(trips) {
    const grouped = {};

    trips.forEach(trip => {
        const date = new Date(trip.createdAt);
        const year = date.getFullYear();
        const month = date.toLocaleString('en-US', { month: 'long' });

        if (!grouped[year]) {
            grouped[year] = {};
        }
        if (!grouped[year][month]) {
            grouped[year][month] = [];
        }

        grouped[year][month].push(trip);
    });

    return grouped;
}

/**
 * Calculate travel statistics
 * @param {Array} trips - Array of trip objects
 * @returns {Object} Statistics including countries, cities, total trips
 */
function calculateStats(trips) {
    const locations = new Set();
    const countries = new Set();

    trips.forEach(trip => {
        trip.optimizedRoute?.ordered_route?.forEach(stop => {
            if (stop.name) {
                locations.add(stop.name);

                // Extract country from location (simple approach - last part after comma)
                const parts = stop.name.split(',');
                if (parts.length > 1) {
                    const country = parts[parts.length - 1].trim();
                    countries.add(country);
                }
            }
        });
    });

    const firstTrip = trips.length > 0 ? trips[trips.length - 1].createdAt : null;
    const lastTrip = trips.length > 0 ? trips[0].createdAt : null;

    return {
        totalTrips: trips.length,
        countries: countries.size,
        cities: locations.size,
        firstTrip,
        lastTrip,
        yearsOfTravel: calculateYears(firstTrip, lastTrip)
    };
}

/**
 * Calculate years between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Years of travel
 */
function calculateYears(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const years = end.getFullYear() - start.getFullYear();
    return Math.max(years, 1); // At least 1 year if there are trips
}

/**
 * Get map markers data for all user's trips
 * @param {string} userId - User ID
 * @param {boolean} isOwner - Whether the requesting user is the owner
 * @returns {Array} Array of map markers with coordinates and trip info
 */
export async function getMapData(userId, isOwner = true) {
    // Build query filter
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

/**
 * Get trips from this day in past years (On This Day feature)
 * @param {string} userId - User ID
 * @param {number} month - Month (1-12)
 * @param {number} day - Day of month (1-31)
 * @returns {Array} Trips from this day in previous years
 */
export async function getOnThisDay(userId, month, day) {
    const trips = await Trip.find({
        user: userId,
        $expr: {
            $and: [
                { $eq: [{ $month: "$createdAt" }, month] },
                { $eq: [{ $dayOfMonth: "$createdAt" }, day] }
            ]
        }
    })
        .sort({ createdAt: -1 })
        .populate('user', 'firstName lastName avatar')
        .lean();

    return trips;
}
