import TripPost from "../social/TripPost";
import { useUserStore } from "../../store/userStore";
import type { Trip } from "./types";
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

    return {
      id: c._id,
      user: {
        name: `${c.user.firstName} ${c.user.lastName}`,
        username: ` @${c.user.firstName.toLowerCase()}${c.user.lastName.toLowerCase()}`,
        avatar: c.user.avatar || "/default-avatar.png",
      },
      text: c.comment,
      timestamp: time, // use formatted time instead of raw timestamp
      reactionsAggregated: c.reactionsAggregated || {}, // Include aggregated reactions
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
      name: trip.user?.firstName + " " + trip.user?.lastName || `${trip.user?.id || ""}`,
      username:
        (trip.user?.firstName + " " + trip.user?.lastName || "").toLowerCase().replace(/\s+/g, "") ||
        trip.user?.id ||
        "",
      avatar: trip.user?.avatar || "/default-avatar.png",
      isFollowing: !!trip.user?.isFollowing,
    },
    location: trip.location || trip.description || "",
    duration: trip.duration || "",
    description: trip.description || "",
    activities: trip.activities || [],
    images: trip.images || [],
    likes: trip.likes || 0,
    comments: trip.comments || [],
    isLiked: !!trip.isLiked,
    isSaved: !!trip.isSaved,
    optimizedRoute: trip.optimizedRoute,
    comments: adaptComments(trip.comments || []),
  };

  

  return (
    <div>
      <TripPost trip={mapped} setTrips={setTrips} />
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
