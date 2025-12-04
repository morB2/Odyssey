import express from "express";
import path from "path";
import http from "http";
import cors from "cors";
import { routesInit } from "./routes/config_routes.js";
import "./db/mongoConect.js";
import { config } from "./config/secret.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { initializeSocket } from "./utils/socket.js";
import fs from "fs";
import cloudinary from "./config/cloudinary.js";

const app = express();

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists and serve it statically
const uploadsDir = path.join(process.cwd(), "temp_uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

routesInit(app);

app.use(errorHandler);

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

const port = config.port || 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
