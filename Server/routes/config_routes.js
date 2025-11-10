import LoginR from "./loginRoute.js";
import createTrip from "./createTripRoute.js";
import profile from "./profileRoute.js";

export function routesInit(app) {
  app.use("/login", LoginR);
  app.use("/createTrip", createTrip);
  app.use("/profile", profile);
}
