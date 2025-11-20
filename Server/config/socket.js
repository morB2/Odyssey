import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './secret.js';

let io;

/**
 * Initialize Socket.IO server
 * @param {http.Server} server - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
            const decoded = jwt.verify(token, config.tokenSecret);
            socket.userId = decoded._id;
            next();
        } catch (err) {
            console.error('Socket authentication error:', err.message);
            socket.userId = null;
            next(); // Allow connection but as unauthenticated
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}, User: ${socket.userId || 'anonymous'}`);

        // Join a trip-specific room
        socket.on('joinTrip', (tripId) => {
            socket.join(`trip:${tripId}`);
            console.log(`User ${socket.userId} joined trip room: ${tripId}`);
        });

        // Leave a trip-specific room
        socket.on('leaveTrip', (tripId) => {
            socket.leave(`trip:${tripId}`);
            console.log(`User ${socket.userId} left trip room: ${tripId}`);
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
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    console.log('✅ Socket.IO server initialized');
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
