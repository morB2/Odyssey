// --- 1. Destination Type (for points in the itinerary) ---
export interface Destination {
    name: string;
    note: string;
    // Add other properties that your backend sends for a destination if needed, 
    // e.g., location, lat/lng, estimatedTime
}

// --- 2. Itinerary Type (for the suggestions) ---
export interface Itinerary {
    title: string;
    description: string;
    destinations: Destination[];
    // Add other top-level properties from your suggestion data if needed, 
    // e.g., duration, budget
}

// --- 3. Rich Content Type (for structured chat messages) ---
export interface RichContent {
    // Defines the kind of rich component to render
    type: 'suggestions' | 'travelModeSelection' | 'tripDisplay'; 
    data: any; // The data payload for that specific component
}

// --- 4. Message Type (for the chat bubbles) ---
export interface Message {
    id: number;
    text: string | null; // Text is null when rich content is present
    sender: 'user' | 'ai';
    timestamp: Date;
    content?: RichContent; // Optional rich content payload
}

// --- 5. Trip Route Type (for the detailed TripDisplay) ---
// This is based on the data sent to the 'tripDisplay' content type, 
// which contains the optimized route information.
export interface TripRouteData {
    success: boolean;
    route: {
        totalDistance: string;
        totalDuration: string;
        ordered_route: any[]; // The detailed route steps
        instructions: string[]; // Directions
        google_maps_url: string;
    };
    // Include other trip display data if necessary
}