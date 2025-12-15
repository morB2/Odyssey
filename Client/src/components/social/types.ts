// types.ts (shared file)
export interface Comment {
  id: string;
  userId?: string;  // ID of the user who created the comment
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  reactionsAggregated?: Record<string, number>;
  replies?: Comment[];
}

export interface TripUser {            // unified id
  _id: string;            // optional if coming from backend
  firstName: string;      // optional for feed display
  lastName: string;       // optional for feed display       // optional, can be generated from names
  avatar: string;
  isFollowing: boolean;
}

export interface Trip {
  _id: string;
  user: TripUser;
  title?: string | "";          // optional for TripPost
  location?: string;       // optional for TripFeed
  duration?: string;
  description: string;
  activities: string[];
  images: string[];
  likes: number;
  views: number;
  comments?: Comment[];
  isLiked: boolean;
  isSaved: boolean;
  notes?: string;
  detailedData?: any;
  optimizedRoute?: any;
  currentUserId: string;
  visabilityStatus: string | undefined;
}
