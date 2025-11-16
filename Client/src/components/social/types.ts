// types.ts (shared file)
export interface Comment {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  reactionsAggregated?: Record<string, number>;
}

export interface TripUser {
  id: string;              // unified id
  _id?: string;            // optional if coming from backend
  firstName?: string;      // optional for feed display
  lastName?: string;       // optional for feed display
  name?: string;           // optional for TripPost
  username?: string;       // optional, can be generated from names
  avatar: string;
  isFollowing: boolean;
}

export interface Trip {
  id: string;
  user: TripUser;
  title?: string;          // optional for TripPost
  location?: string;       // optional for TripFeed
  duration?: string;
  description: string;
  activities: string[];
  images: string[];
  likes: number;
  comments?: Comment[];
  isLiked: boolean;
  isSaved: boolean;
  notes?: string;
  detailedData?: any;
  optimizedRoute?: any;
  currentUserId?: string;
}
