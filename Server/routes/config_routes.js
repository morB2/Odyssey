import LoginR from "./loginRoute.js";
import createTrip from "./createTripRoute.js";
import profile from "./profileRoute.js";
import trip from "./tripRoutes.js";
import sendEmail from "./sendEmailRoute.js";

export function routesInit(app) {
  app.use("/login", LoginR);
  app.use("/createTrip", createTrip);
  app.use("/profile", profile);
  app.use('/trips', trip);
  app.use("/sendEmail", sendEmail);

}
