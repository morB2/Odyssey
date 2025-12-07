import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_URL || "https://odyssey-dbdn.onrender.com";

let socket: Socket | null = null;

/**
 * Initialize Socket.IO connection
 * @param token - JWT authentication token (optional)
 * @returns Socket instance
 */
export const initializeSocket = (token?: string): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: token || "",
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {});

  socket.on("disconnect", (reason) => {});

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  return socket;
};

/**
 * Get the current Socket.IO instance
 * @returns Socket instance or null if not initialized
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Disconnect the Socket.IO connection
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Join a trip-specific room
 * @param tripId - Trip ID to join
 */
export const joinTripRoom = (tripId: string): void => {
  if (socket && socket.connected) {
    socket.emit("joinTrip", tripId);
  }
};

/**
 * Leave a trip-specific room
 * @param tripId - Trip ID to leave
 */
export const leaveTripRoom = (tripId: string): void => {
  if (socket && socket.connected) {
    socket.emit("leaveTrip", tripId);
  }
};

/**
 * Emit typing indicator
 * @param tripId - Trip ID
 * @param userName - User's name
 */
export const emitTyping = (tripId: string, userName: string): void => {
  if (socket && socket.connected) {
    socket.emit("typing", { tripId, userName });
  }
};

/**
 * Emit stop typing indicator
 * @param tripId - Trip ID
 */
export const emitStopTyping = (tripId: string): void => {
  if (socket && socket.connected) {
    socket.emit("stopTyping", { tripId });
  }
};

/**
 * Subscribe to new comment events
 * @param callback - Callback function to handle new comments
 */
export const onNewComment = (callback: (data: any) => void): void => {
  if (socket) {
    socket.on("newComment", callback);
  }
};

/**
 * Subscribe to new reaction events
 * @param callback - Callback function to handle new reactions
 */
export const onNewReaction = (callback: (data: any) => void): void => {
  if (socket) {
    socket.on("newReaction", callback);
  }
};

/**
 * Subscribe to new reply events
 * @param callback - Callback function to handle new replies
 */
export const onNewReply = (callback: (data: any) => void): void => {
  if (socket) {
    socket.on("newReply", callback);
  }
};

/**
 * Subscribe to like update events
 * @param callback - Callback function to handle like updates
 */
export const onLikeUpdate = (callback: (data: any) => void): void => {
  if (socket) {
    socket.on("likeUpdate", callback);
  }
};

/**
 * Subscribe to save update events
 * @param callback - Callback function to handle save updates
 */
export const onSaveUpdate = (callback: (data: any) => void): void => {
  if (socket) {
    socket.on("saveUpdate", callback);
  }
};

/**
 * Subscribe to typing indicator events
 * @param callback - Callback function to handle typing indicators
 */
export const onUserTyping = (callback: (data: any) => void): void => {
  if (socket) {
    socket.on("userTyping", callback);
  }
};

/**
 * Subscribe to stop typing indicator events
 * @param callback - Callback function to handle stop typing indicators
 */
export const onUserStoppedTyping = (callback: (data: any) => void): void => {
  if (socket) {
    socket.on("userStoppedTyping", callback);
  }
};

/**
 * Unsubscribe from an event
 * @param eventName - Name of the event to unsubscribe from
 * @param callback - Optional specific callback to remove
 */
export const offEvent = (
  eventName: string,
  callback?: (data: any) => void
): void => {
  if (socket) {
    if (callback) {
      socket.off(eventName, callback);
    } else {
      socket.off(eventName);
    }
  }
};
