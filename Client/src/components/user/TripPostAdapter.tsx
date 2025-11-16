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
    currentUserId,
    id: trip.id,
    user: {
      id: trip.user?.id || "",
      name: trip.user?.name || `${trip.user?.id || ""}`,
      username:
        (trip.user?.name || "").toLowerCase().replace(/\s+/g, "") ||
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
  };

  return (
    <div>
      <TripPost trip={mapped} setTrips={setTrips} />
      {storeUser?._id === trip.user?.id && (
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
