import { useState, useEffect } from "react";
import type { Trip } from "./types";
import { Card, Chip, Box, Typography, IconButton } from "@mui/material";
import {
  Car,
  FootprintsIcon,
  Lock,
  Globe,
  Bus,
  Heart,
  Bookmark,
} from "lucide-react";
import { useUserStore } from "../../store/userStore";
const BASE_URL = "http://localhost:3000";

interface TripCardProps {
  trip: Trip;
  onClick: () => void;
  onLike?: (tripId: string, liked: boolean) => Promise<void> | void;
  onSave?: (tripId: string, saved: boolean) => Promise<void> | void;
}

interface TripCardPropsExt extends TripCardProps {
  currentUserId?: string;
}

export function TripCard({
  trip,
  onClick,
  onSave,
  currentUserId,
}: TripCardPropsExt) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState<boolean>(!!trip.liked);
  const [saved, setSaved] = useState<boolean>(!!trip.saved);
  const [likesCount, setLikesCount] = useState<number>(trip.likes || 0);
  const storeUser = useUserStore((s) => s.user);
  const storeToken = useUserStore((s) => s.token);

  useEffect(() => {
    if (trip.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % trip.images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [trip.images.length]);

  // sync social state when trip changes
  useEffect(() => {
    // get fresh like/save status from the server
    /*scema of likes:
    
import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  },
  { timestamps: true }
);

// Optional: ensure a user can like a trip only once
LikeSchema.index({ user: 1, trip: 1 }, { unique: true });

export default mongoose.model("Like", LikeSchema);
*/

    setLiked(!!trip.liked);
    setSaved(!!trip.saved);
    setLikesCount(trip.likes || 0);
  }, [trip]);

  const getModeIcon = () => {
    switch (trip.mode) {
      case "car":
        return <Car size={16} />;
      case "walk":
        return <FootprintsIcon size={16} />;
      case "transit":
        return <Bus size={16} />;
      default:
        return <Car size={16} />;
    }
  };

  const routePreview = trip.route.join(" → ");

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    // optimistic update
    setLikesCount((c) => (newLiked ? c + 1 : Math.max(0, c - 1)));
    try {
      const url = `${BASE_URL}/likes/${trip.id}/${
        newLiked ? "like" : "unlike"
      }`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${storeToken}`,
        },
        body: JSON.stringify({
          userId: storeUser?._id,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          body?.error || body?.message || "Failed to update like status"
        );

      // if server returned the updated likes count, sync to authoritative value
      if (typeof body?.likes === "number") {
        setLikesCount(body.likes);
      }
    } catch (err) {
      // rollback on error
      setLiked(!newLiked);
      setLikesCount((c) => (newLiked ? Math.max(0, c - 1) : c + 1));
      console.error("like failed", err);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSaved = !saved;
    setSaved(newSaved);
    try {
      if (onSave) await onSave(trip.id, newSaved);
    } catch (err) {
      setSaved(!newSaved);
      console.error("save failed", err);
    }
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: "pointer",
        overflow: "hidden",
        border: "1px solid #e5e5e5",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow:
            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: 192,
          overflow: "hidden",
          backgroundColor: "#f5f5f5",
        }}
      >
        {trip.images.map((image, index) => (
          <Box
            key={index}
            component="img"
            src={image}
            alt={`${trip.title} - ${index + 1}`}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: index === currentImageIndex ? 1 : 0,
              transition: "opacity 0.7s",
            }}
          />
        ))}
        <Box
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            display: "flex",
            gap: 1,
          }}
        >
          <Chip
            icon={getModeIcon()}
            label={
              <span style={{ textTransform: "capitalize" }}>{trip.mode}</span>
            }
            sx={{
              border: "1px solid #e5e5e5",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(4px)",
              color: "#404040",
              height: "auto",
              "& .MuiChip-label": {
                px: 1,
                py: 0.5,
                fontSize: "0.875rem",
              },
              "& .MuiChip-icon": {
                ml: 1,
                mr: -0.5,
              },
            }}
          />
          <Chip
            icon={
              trip.visibility === "private" ? (
                <Lock size={14} />
              ) : (
                <Globe size={14} />
              )
            }
            sx={{
              border: "1px solid #e5e5e5",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(4px)",
              color: "#404040",
              height: "auto",
              "& .MuiChip-label": {
                display: "none",
              },
              "& .MuiChip-icon": {
                m: 0.75,
              },
              minWidth: "auto",
            }}
          />
        </Box>
      </Box>
      <Box sx={{ p: 2.5 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 1,
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "#171717",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
        >
          {trip.title}
        </Typography>
        <Typography
          sx={{
            mb: 1.5,
            fontSize: "0.875rem",
            color: "#525252",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {trip.description}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            color: "#737373",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                backgroundColor: "#f97316",
              }}
            />
            <Typography
              sx={{
                fontSize: "0.875rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
              }}
            >
              {routePreview}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <IconButton
                size="small"
                onClick={handleLike}
                aria-label="like"
                sx={{
                  transition: "transform 0.15s ease-in-out",
                  "&:active": { transform: "scale(1.2)" },
                }}
              >
                <Heart
                  size={16}
                  color={liked ? "#ef4444" : undefined}
                  fill={liked ? "#ef4444" : "none"}
                />
              </IconButton>
              <Typography sx={{ fontSize: "0.75rem", color: "#737373" }}>
                {likesCount}
              </Typography>
            </Box>
            {trip.ownerId && trip.ownerId !== currentUserId && (
              <IconButton size="small" onClick={handleSave} aria-label="save">
                <Bookmark size={16} color={saved ? "#1f2937" : undefined} />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
