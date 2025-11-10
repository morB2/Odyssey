import express from 'express';
import path from 'path';
import http from 'http';
import cors from 'cors';
import { routesInit } from './routes/config_routes.js';
import './db/mongoConect.js';
import { config } from './config/secret.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

routesInit(app);

app.use(errorHandler);

const server = http.createServer(app);

const port = config.port || 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
