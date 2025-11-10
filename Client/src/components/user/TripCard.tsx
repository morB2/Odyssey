import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Box,
} from "@mui/material";
import type { TripItem } from "./types";

export default function TripCard({
  trip,
  onEdit,
  onDelete,
}: {
  trip: TripItem;
  onEdit: (t: TripItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      {trip.image && (
        <CardMedia
          component="img"
          height="180"
          image={trip.image}
          alt={trip.title}
        />
      )}
      <CardContent>
        <Typography variant="h6" fontWeight={600}>
          {trip.title || "Untitled"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {trip.location}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between" }}>
        <Box>
          <IconButton size="small" onClick={() => onEdit(trip)}>
            Edit
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(trip._id)}>
            Delete
          </IconButton>
        </Box>
        <Typography variant="caption">❤️ {trip.likes || 0}</Typography>
      </CardActions>
    </Card>
  );
}
