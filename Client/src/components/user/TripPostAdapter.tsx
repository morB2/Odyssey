import { useState } from "react";
import TripPost from "../social/TripPost";
import { useUserStore } from "../../store/userStore";
import type { Trip } from "./types";
import { Box, IconButton } from "@mui/material";
import type { Comment } from "../social/types";
import { Trash2, Edit } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";

interface AdapterProps {
  trip: Trip;
  onDelete: () => void;
  onEdit: () => void;
}

// Shared styles
const actionsContainerStyle = { position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 1, zIndex: 10 };
const iconButtonStyle = { color: "#6b7280", backgroundColor: "rgba(255, 255, 255, 0.9)", "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" } };
function adaptComments(apiComments: any[]): Comment[] {
  return apiComments.map((c) => {
    const date = new Date(c.timestamp);
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
      id: c.id || c._id,
      userId: c.userId,
      user: {
        name: `${firstName} ${lastName}`,
        username: `@${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        avatar: c.user?.avatar || "/default-avatar.png",
      },
      // Prefer normalized `text` from the API, fall back to legacy `comment` field
      text: c.text,
      timestamp: time, // use formatted time instead of raw timestamp
      reactionsAggregated: c.reactionsAggregated || {}, // Include aggregated reactions
      replies: c.replies ? adaptComments(c.replies) : [], // Recursively adapt replies
    };
  });
}
export default function TripPostAdapter({ trip, onDelete, onEdit }: AdapterProps) {
  const storeUser = useUserStore((s) => s.user);
  const currentUserId = storeUser?._id || "";
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const mapped = {
    _id: String(trip._id || trip.id || ""),
    currentUserId,
    id: trip.id,
    user: {
      _id: String(trip.user?._id || trip.user?.id || ""),
      id: trip.user?.id || "",
      firstName: trip.user.firstName || "",
      lastName: trip.user.lastName || "",
      username: (trip.user?.firstName + " " + trip.user?.lastName || "").toLowerCase().replace(/\s+/g, "") || trip.user?.id || "",
      avatar: trip.user?.avatar || "/default-avatar.png",
      isFollowing: !!trip.user?.isFollowing,
    },
    location: trip.location || trip.description || "",
    duration: trip.duration || "",
    title: trip.title || "",
    description: trip.description || "",
    activities: trip.activities || [],
    images: trip.images || [],
    likes: trip.likes || 0,
    views: trip.views || 0,
    isLiked: !!trip.isLiked,
    isSaved: !!trip.isSaved,
    optimizedRoute: trip.optimizedRoute,
    comments: adaptComments(trip.comments || []),
  };

  const handleDeleteClick = () => setShowDeleteConfirm(true);
  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const ActionButton = ({ onClick, Icon, hoverColor }: { onClick: () => void; Icon: any; hoverColor: string }) => (
    <IconButton onClick={onClick} size="small" sx={{ ...iconButtonStyle, "&:hover": { ...iconButtonStyle["&:hover"], color: hoverColor } }}>
      <Icon size={18} />
    </IconButton>
  );

  return (
    <>
      <Box sx={{ position: "relative" }}>
        <TripPost trip={mapped} />
        {storeUser?._id === trip.user?._id && (
          <Box sx={actionsContainerStyle}>
            <ActionButton onClick={onEdit} Icon={Edit} hoverColor="#374151" />
            <ActionButton onClick={handleDeleteClick} Icon={Trash2} hoverColor="#dc2626" />
          </Box>
        )}
      </Box>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Trip"
        message="Are you sure you want to delete this trip? This action cannot be undone."
      />
    </>
  );
}
