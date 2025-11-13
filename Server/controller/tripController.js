import { getTripsForUser ,postCommentForUser} from "../services/crudTripService.js";


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

export async function postComment(req, res) {
  try {
    const { tripId } = req.params;
    const { comment,userId} = req.body;
    const newComment = await postCommentForUser(tripId, userId, comment);
    res.status(201).json(newComment);
  } catch (err) {
    console.error("Error posting comment:", err);
    res.status(400).json({ error: err.message });
  }
}
