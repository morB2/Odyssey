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

export interface Trip {
  id: string;
  title: string;
  description: string;
  images: string[];
  route: string[];
  routeInstructions: RouteInstruction[];
  mode: "car" | "walk" | "transit";
  visibility: "public" | "private";
  activities: string[];
  notes: string;
  // optional social fields
  likes?: number;
  liked?: boolean; // whether the current user liked this trip
  saved?: boolean; // whether the current user saved this trip
  ownerId?: string;
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
