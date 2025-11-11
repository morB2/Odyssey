import Trip from "../models/tripModel.js";

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
