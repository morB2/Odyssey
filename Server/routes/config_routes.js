import googleLoginR from './googleLoginRoute.js';
import createTrip from './createTripRoute.js';

export function routesInit(app) {
    app.use("/googleLogin", googleLoginR);
    app.use("/createTrip",createTrip)
}
