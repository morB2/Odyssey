import LoginR from "./loginRoute.js";
import createTrip from "./createTripRoute.js";
import profile from "./profileRoute.js";
import trip from "./tripRoutes.js";
import {authMiddleware as autoM} from '../middleware/authMiddleware.js';

export function routesInit(app) {
  app.use("/login", LoginR);
  app.use("/createTrip", createTrip);
  app.use("/profile",autoM, profile);
  app.use('/trips', trip);
}
