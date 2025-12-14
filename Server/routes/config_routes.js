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
import collections from './collectionRoutes.js';
import contact from './contactRoutes.js';
import { authMiddleware as autoM } from '../middleware/authMiddleware.js';

export function routesInit(app) {
  app.use("/login", LoginR);
  app.use("/createTrip", createTrip);
  app.use("/profile", autoM, profile);
  app.use('/trips', trip);
  app.use("/sendEmail", sendEmail);
  app.use("/contact", contact);

  app.use('/likes', autoM, like);
  app.use('/saves', autoM, save);
  app.use('/follow', autoM, follow); // ✅ Protected: user actions require auth
  app.use('/users', autoM, users);   // ✅ Protected: user data modification requires auth
  app.use('/reports', autoM, reports); // ✅ Protected: reporting requires auth
  app.use('/chat', autoM, chat);     // ✅ Protected: chat requires auth
  app.use('/search', search);        // Public: search stays accessible
  app.use('/admin', admin);          // Already has auth check in controller
  app.use('/collections', autoM, collections); // ✅ Protected: collections require auth
}
