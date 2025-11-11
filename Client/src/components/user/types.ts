export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  profilePicture: string;
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
  mode: "car" | "walk" | "bike" | "train" | "plane";
  distance?: string;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  images: string[];
  route: string[];
  routeInstructions: RouteInstruction[];
  mode: "car" | "walk" | "bike" | "train" | "plane";
  visibility: "public" | "private";
  activities: string[];
  notes: string;
  // optional social fields
  likes?: number;
  liked?: boolean; // whether the current user liked this trip
  saved?: boolean; // whether the current user saved this trip
  ownerId?: string;
}
