import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/secret.js';

let io;

/**
 * Initialize Socket.IO server
 * @param {http.Server} server - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'https://odyssey-v1nq-git-main-mors-projects-49250beb.vercel.app',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // Middleware for authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            // Allow connection without auth for now, but track as anonymous
            socket.userId = null;
            return next();
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            socket.userId = decoded.userId;
            next();
        } catch (err) {
            console.error('Socket authentication error:', err.message);
            socket.userId = null;
            next(); // Allow connection but as unauthenticated
        }
    });

    io.on('connection', (socket) => {

        // Log all connected users whenever someone connects
        logConnectedUsers();

        // Join user-specific room for direct messaging
        if (socket.userId) {
            socket.join(`user:${socket.userId}`);
        }

        // Join a trip-specific room
        socket.on('joinTrip', (tripId) => {
            socket.join(`trip:${tripId}`);
            logConnectedUsers();
        });

        // Leave a trip-specific room
        socket.on('leaveTrip', (tripId) => {
            socket.leave(`trip:${tripId}`);
            logConnectedUsers();
        });

        // Typing indicator
        socket.on('typing', ({ tripId, userName }) => {
            socket.to(`trip:${tripId}`).emit('userTyping', {
                userId: socket.userId,
                userName,
                tripId,
            });
        });

        // Stop typing indicator
        socket.on('stopTyping', ({ tripId }) => {
            socket.to(`trip:${tripId}`).emit('userStoppedTyping', {
                userId: socket.userId,
                tripId,
            });
        });

        socket.on('disconnect', () => {
            // Log remaining connected users after disconnect
            setTimeout(() => logConnectedUsers(), 100); // Small delay to ensure disconnect is processed
        });
    });

    return io;
};

/**
 * Get the Socket.IO server instance
 * @returns {Server} Socket.IO server instance
 */
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized. Call initializeSocket first.');
    }
    return io;
};

/**
 * Log all currently connected users
 * Useful for debugging and monitoring active connections
 */
export const logConnectedUsers = () => {
    if (!io) {
        return;
    }

    const sockets = io.sockets.sockets;
    const connectedUsers = [];

    sockets.forEach((socket) => {
        connectedUsers.push({
            socketId: socket.id,
            userId: socket.userId || 'anonymous',
            rooms: Array.from(socket.rooms).filter(room => room !== socket.id), // Exclude default room
        });
    });

    return connectedUsers;
};
