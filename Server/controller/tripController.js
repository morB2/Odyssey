import { getTripsForUser } from "../services/crudTripService.js";


export async function fetchTrips(req, res) {
    try {
        const currentUserId = req.params.id; // assuming user ID is available in req.user
        const trips = await getTripsForUser(currentUserId);
        res.status(200).json(trips);
    } catch (error) {
        console.error("Error fetching trips:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}