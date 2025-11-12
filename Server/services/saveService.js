import Save from "../models/savesModel.js";

export const saveTrip = async (userId, tripId) => {
    const existingSave = await Save.findOne({ user: userId, trip: tripId });
    if (existingSave) throw new Error("You have already saved this trip.");

    const save = new Save({ user: userId, trip: tripId });
    await save.save();
    return save;
};

export const unSaveTrip = async (userId, tripId) => {
    const existingSave = await Save.findOne({ user: userId, trip: tripId });
    if (!existingSave) throw new Error("You have not saved this trip yet.");

    await Save.deleteOne({ _id: existingSave._id });
    return true;
};

export const getSavedTripsByUser = async (userId) => {
    const saves = await Save.find({ user: userId }).populate("trip");
    return saves.map(s => s.trip);
};
