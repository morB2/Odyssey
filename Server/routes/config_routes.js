import LoginR from './loginRoute.js';
import createTrip from './createTripRoute.js';

export function routesInit(app) {
    app.use("/login", LoginR);
    app.use("/createTrip",createTrip)
}
