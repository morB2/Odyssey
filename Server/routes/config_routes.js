import LoginR from "./loginRoute.js";
import createTrip from "./createTripRoute.js";
import profile from "./profileRoute.js";
import trip from "./tripRoutes.js";
import sendEmail from "./sendEmailRoute.js";
import like from "./likeRoutes.js"
import save from "./saveRoutes.js";
import follow from './followRoutes.js';
import users from './usersRoute.js';
import reports from './reportRoutes.js';
import chat from './chatRoutes.js';
import search from './searchRoutes.js';
import admin from './adminRoutes.js';
import { authMiddleware as autoM } from '../middleware/authMiddleware.js';

export function routesInit(app) {
  app.use("/login", LoginR);
  app.use("/createTrip", createTrip);
  app.use("/profile", autoM, profile);
  app.use('/trips', trip);
  app.use("/sendEmail", sendEmail);

  app.use('/likes', like);
  app.use('/saves', save);
  app.use('/follow', follow);
  app.use('/users', users);
  app.use('/reports', reports);
  app.use('/chat', chat);
  app.use('/api/search', search);
  app.use('/admin', admin);
}
