import TripPost from "../social/TripPost";
import { useUserStore } from "../../store/userStore";
import type { Trip } from "./types";
import type { Comment } from "../social/types";
import { Box, Button } from "@mui/material";
import { Trash2, Edit } from "lucide-react";

interface AdapterProps {
  trip: Trip;
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  onDelete: () => void;
  onEdit: () => void;
}

function adaptComments(apiComments: any[]): Comment[] {
  return apiComments.map((c) => {
    const date = new Date(c.createdAt);
    const time = date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Safety checks for user data
    const firstName = c.user?.firstName || "Unknown";
    const lastName = c.user?.lastName || "User";

    return {
      id: c._id,
      user: {
        name: `${firstName} ${lastName}`,
        username: ` @${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        avatar: c.user?.avatar || "/default-avatar.png",
      },
      text: c.comment,
      timestamp: time, // use formatted time instead of raw timestamp
      reactionsAggregated: c.reactionsAggregated || {}, // Include aggregated reactions
      replies: c.replies ? adaptComments(c.replies) : [], // Recursively adapt replies
    };
  });
}

export default function TripPostAdapter({
  trip,
  setTrips,
  onDelete,
  onEdit,
}: AdapterProps) {
  const storeUser = useUserStore((s) => s.user);
  const currentUserId = storeUser?._id || "";

  // Map our client-side Trip to the shape expected by TripPost
  const mapped = {
    _id: String(trip._id || trip.id || ""),
    currentUserId,
    id: trip.id,
    user: {
      _id: String(trip.user?._id || trip.user?.id || ""),
      id: trip.user?.id || "",
      firstName: trip.user.firstName || "",
      lastName: trip.user.lastName || "",
      username:
        (trip.user?.firstName + " " + trip.user?.lastName || "").toLowerCase().replace(/\s+/g, "") ||
        trip.user?.id ||
        "",
      avatar: trip.user?.avatar || "/default-avatar.png",
      isFollowing: !!trip.user?.isFollowing,
    },
    title: trip.location || "",
    location: trip.location || trip.description || "",
    duration: trip.duration || "",
    description: trip.description || "",
    activities: trip.activities || [],
    images: trip.images || [],
    likes: trip.likes || 0,
    isLiked: !!trip.isLiked,
    isSaved: !!trip.isSaved,
    optimizedRoute: trip.optimizedRoute,
    comments: adaptComments(trip.comments || []),
  };

  console.log("server trip\n", trip.user, "map\n", mapped.user);


  return (
    <div>
      <TripPost trip={mapped} />
      {storeUser?._id === trip.user?._id && (
        <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              onDelete();
            }}
            sx={{
              borderColor: "#fca5a5",
              color: "#dc2626",
              textTransform: "none",
              "&:hover": {
                borderColor: "#f87171",
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
              },
            }}
          >
            <Trash2 size={16} style={{ marginRight: "8px" }} />
            Delete
          </Button>
          <Button
            onClick={onEdit}
            variant="contained"
            sx={{
              backgroundColor: "#f97316",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#ea580c",
              },
            }}
          >
            <Edit size={16} style={{ marginRight: "8px" }} />
            Edit Trip
          </Button>
        </Box>
      )}
    </div>
  );
}
