import Trip from "../models/tripModel.js";
import {
  getSuggestions,
  optimizeRoute,
  customizeTrip,
} from "../services/createTripServices.js";

// re-export service helpers so routes/controllers can import from this controller
export { getSuggestions, optimizeRoute, customizeTrip };

export async function saveTrip({
  user,
  title,
  description,
  optimizedRoute,
  activities = [],
  notes = "",
  visabilityStatus,
}) {
  const doc = await Trip.create({
    user: user || null,
    title: title || "",
    description: description || "",
    optimizedRoute: optimizedRoute || {},
    activities: activities || [],
    notes: notes || "",
    visabilityStatus: visabilityStatus,
  });
  return doc;
}
