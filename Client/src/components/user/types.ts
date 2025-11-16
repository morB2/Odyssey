export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  followersCount?: number;
  followingCount?: number;
  followers?: Array<{
    id: string;
    fullName: string;
    username?: string;
    profilePicture?: string;
  }>;
  following?: Array<{
    id: string;
    fullName: string;
    username?: string;
    profilePicture?: string;
  }>;
}

export interface RouteInstruction {
  step: number;
  instruction: string;
  mode: "car" | "walk" | "tansit";
  distance?: string;
}

export interface Comment {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
}

export interface Trip {
  id?: string;
  _id: string;
  user: {
    id?: string;
    _id: string;
    name: string;
    username: string;
    avatar: string;
    isFollowing: boolean;
  };
  location: string;
  duration: string;
  description: string;
  activities: string[];
  images: string[];
  likes: number;
  comments?: Comment[]; // now typed
  isLiked: boolean;
  isSaved: boolean;
  detailedData?: any;
  optimizedRoute?: any;
  currentUserId?: string;
}

export type ServerTrip = {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  images?: string[];
  optimizedRoute?: {
    ordered_route?: Array<{ name?: string }>;
    instructions?: string[];
    mode?: string;
  };
  route?: string[];
  routeInstructions?: Array<{
    step?: number;
    instruction?: string;
    mode?: string;
    distance?: string;
  }>;
  mode?: string;
  visabilityStatus?: string;
  activities?: string[];
  notes?: string;
};
