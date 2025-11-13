import { useState } from "react";
import type { ComponentType } from "react";
import axios from "axios";
import type { Trip } from "./types";
import TripPost from "../social/TripPost";
import { useUserStore } from "../../store/userStore";

interface AdapterProps {
  trip: Trip;
  onClick?: () => void; // optional: preserve previous behavior
}

// local shape that matches essential parts of the TripPost expected `trip` prop
type TripPostShape = {
  id: string;
  user: {
    id?: string;
    name?: string;
    username?: string;
    avatar?: string;
    isFollowing?: boolean;
  };
  location?: string;
  duration?: string;
  description?: string;
  activities?: string[];
  images?: string[];
  likes?: number;
  comments?: unknown[];
  isLiked?: boolean;
  isSaved?: boolean;
  currentUserId?: string | undefined;
  [k: string]: unknown;
};

export default function TripPostAdapter({ trip, onClick }: AdapterProps) {
  const storeUser = useUserStore((s) => s.user);
  const currentUserId = storeUser?._id;

  // local UI state for optimistic updates
  const [isLiked, setIsLiked] = useState<boolean>(!!trip.liked);
  const [likes, setLikes] = useState<number>(trip.likes || 0);
  const [isSaved, setIsSaved] = useState<boolean>(!!trip.saved);

  const toggleLike = async (id: string) => {
    // optimistic
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikes((c) => (newLiked ? c + 1 : Math.max(0, c - 1)));

    try {
      const url = `http://localhost:3000/likes/${id}/${
        newLiked ? "like" : "unlike"
      }`;
      const res = await axios.post(url, { userId: currentUserId });
      if (res?.data && typeof res.data.likes === "number")
        setLikes(res.data.likes);
    } catch (err) {
      // rollback
      setIsLiked(!newLiked);
      setLikes((c) => (newLiked ? Math.max(0, c - 1) : c + 1));
      console.error("like failed", err);
    }
  };

  const toggleSave = async (id: string) => {
    const newSaved = !isSaved;
    setIsSaved(newSaved);
    try {
      const url = `http://localhost:3000/saves/${id}/${
        newSaved ? "save" : "unsave"
      }`;
      await axios.post(url, { userId: currentUserId });
    } catch (err) {
      setIsSaved(!newSaved);
      console.error("save failed", err);
    }
  };

  // map your Trip -> TripPost's expected trip shape
  const postShape = {
    id: trip.id,
    user: {
      id: trip.ownerId || "",
      name: "", // server doesn't include full owner info here; leave blank
      username: "",
      avatar: "",
      isFollowing: false,
    },
    location: trip.title,
    duration: "",
    description: trip.description,
    activities: trip.activities || [],
    images: trip.images || [],
    likes: likes,
    comments: [],
    isLiked: isLiked,
    isSaved: isSaved,
    detailedData: undefined,
    optimizedRoute: undefined,
    currentUserId: currentUserId,
  } as TripPostShape;

  const TripPostAny = TripPost as unknown as ComponentType<
    Record<string, unknown>
  >;

  return (
    <div
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      <TripPostAny
        trip={postShape}
        onLike={() => toggleLike(trip.id)}
        onSave={() => toggleSave(trip.id)}
        onFollow={() => {
          /* no-op for now */
        }}
      />
    </div>
  );
}
