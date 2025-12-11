import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, initializeSocket } from '../services/socketService';

/**
 * Custom hook for managing Socket.IO connection and events
 * @param token - Optional JWT token for authentication
 * @returns Socket instance
 */
export const useSocket = (token?: string): Socket | null => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Initialize socket connection
        const socket = initializeSocket(token);
        socketRef.current = socket;

        return () => {
            // Cleanup is handled by the parent component or app-level
            // We don't disconnect here to maintain persistent connection
        };
    }, [token]);

    return socketRef.current;
};

/**
 * Custom hook for joining/leaving a trip room
 * @param tripId - Trip ID to join
 */
export const useTripRoom = (tripId: string | null) => {
    const socket = getSocket();

    useEffect(() => {
        if (!socket || !tripId) return;
        // Join the trip room
        socket.emit('joinTrip', tripId);

        return () => {
            // Leave the trip room on cleanup
            socket.emit('leaveTrip', tripId);
        };
    }, [socket, tripId]);
};

export const useUserRoom = (userId: string | null) => {
  const socket = getSocket();

  useEffect(() => {
    if (!socket || !userId) return;

    console.log("Joining USER ROOM:", `user:${userId}`);
    socket.emit("joinUserRoom", userId);

    return () => {
      console.log("Leaving USER ROOM:", `user:${userId}`);
      socket.emit("leaveUserRoom", userId);
    };
  }, [socket, userId]);
};
/**
 * Custom hook for subscribing to Socket.IO events
 * @param eventName - Name of the event to subscribe to
 * @param callback - Callback function to handle the event
 */
export const useSocketEvent = (eventName: string, callback: (data: any) => void) => {
    const socket = getSocket();
    const callbackRef = useRef(callback);

    // Update callback ref when it changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!socket) return;

        const eventHandler = (data: any) => {
            callbackRef.current(data);
        };

        socket.on(eventName, eventHandler);

        return () => {
            socket.off(eventName, eventHandler);
        };
    }, [socket, eventName]);
};
