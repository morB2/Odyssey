import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet"; // ✅ Security headers and CSP
import dotenv from "dotenv";
import { routesInit } from "./routes/config_routes.js";
import "./db/mongoConect.js";
import { config } from "./config/secret.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { initializeSocket } from "./utils/socket.js";
import fs from "fs";
import cloudinary from "./config/cloudinary.js";
import path from "path";
import { fileURLToPath } from "url";
const app = express();

dotenv.config();
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',');

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ✅ Security headers and Content Security Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Note: Remove unsafe-inline in production when possible
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:", "https://res.cloudinary.com"], // Allow Cloudinary
      connectSrc: ["'self'", ...allowedOrigins.filter(o => o)],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https://res.cloudinary.com"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false // Allow embedding from Cloudinary
}));

app.use(express.json({ limit: '10mb' })); // ✅ Prevent large payload DoS
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // ✅ Prevent large payload DoS

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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});
const port = config.port || 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
