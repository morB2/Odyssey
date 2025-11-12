import { useState } from "react";
import type { Trip } from "./types";
import { Modal } from "./Modal";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Car,
  FootprintsIcon,
  Lock,
  Globe,
  MapPin,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Bike,
  Train,
  Plane,
  Navigation,
} from "lucide-react";

interface TripDetailsModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TripDetailsModal({
  trip,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TripDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!trip) return null;

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "car":
        return <Car size={16} />;
      case "walk":
        return <FootprintsIcon size={16} />;
      case "bike":
        return <Bike size={16} />;
      case "train":
        return <Train size={16} />;
      case "plane":
        return <Plane size={16} />;
      default:
        return <Car size={16} />;
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % trip.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + trip.images.length) % trip.images.length
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={trip.title} maxWidth="4xl">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Image Gallery */}
        <Box
          sx={{
            position: "relative",
            height: 320,
            overflow: "hidden",
            borderRadius: 2,
            border: "1px solid #e5e5e5",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Box
            component="img"
            src={trip.images[currentImageIndex]}
            alt={`${trip.title} - ${currentImageIndex + 1}`}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {trip.images.length > 1 && (
            <>
              <IconButton
                onClick={prevImage}
                sx={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    backgroundColor: "#ffffff",
                  },
                }}
              >
                <ChevronLeft size={20} />
              </IconButton>
              <IconButton
                onClick={nextImage}
                sx={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    backgroundColor: "#ffffff",
                  },
                }}
              >
                <ChevronRight size={20} />
              </IconButton>
              <Box
                sx={{
                  position: "absolute",
                  bottom: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 1,
                }}
              >
                {trip.images.map((_, index) => (
                  <Box
                    key={index}
                    component="button"
                    onClick={() => setCurrentImageIndex(index)}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor:
                        index === currentImageIndex
                          ? "#ffffff"
                          : "rgba(255, 255, 255, 0.5)",
                      transition: "background-color 0.2s",
                      p: 0,
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>

        {/* Badges */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Chip
            icon={getModeIcon(trip.mode)}
            label={
              <span style={{ textTransform: "capitalize" }}>{trip.mode}</span>
            }
            sx={{
              border: "1px solid #e5e5e5",
              backgroundColor: "#f5f5f5",
              color: "#404040",
              "& .MuiChip-icon": {
                ml: 1,
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
            label={
              <span style={{ textTransform: "capitalize" }}>
                {trip.visibility}
              </span>
            }
            sx={{
              border: "1px solid #e5e5e5",
              backgroundColor: "#f5f5f5",
              color: "#404040",
              "& .MuiChip-icon": {
                ml: 1,
              },
            }}
          />
        </Box>

        {/* Description */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              mb: 1,
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#171717",
            }}
          >
            Description
          </Typography>
          <Typography sx={{ color: "#404040", fontSize: "1rem" }}>
            {trip.description}
          </Typography>
        </Box>

        <Divider sx={{ backgroundColor: "#e5e5e5" }} />

        {/* Route Instructions */}
        <Box>
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Navigation size={20} color="#f97316" />
            <Typography
              variant="h6"
              sx={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "#171717",
              }}
            >
              Route Instructions
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {trip.routeInstructions.map((instruction) => (
              <Box
                key={instruction.step}
                sx={{
                  display: "flex",
                  gap: 2,
                  borderRadius: 2,
                  border: "1px solid #e5e5e5",
                  backgroundColor: "#fafafa",
                  p: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    borderRadius: "50%",
                    backgroundColor: "#f97316",
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  {instruction.step}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ mb: 0.5 }}>
                    <Typography sx={{ color: "#171717", fontSize: "1rem" }}>
                      {instruction.instruction}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      color: "#525252",
                      fontSize: "0.875rem",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {getModeIcon(instruction.mode)}
                      <Typography
                        component="span"
                        sx={{
                          textTransform: "capitalize",
                          fontSize: "0.875rem",
                        }}
                      >
                        {instruction.mode}
                      </Typography>
                    </Box>
                    {instruction.distance && (
                      <>
                        <Typography component="span">•</Typography>
                        <Typography
                          component="span"
                          sx={{ fontSize: "0.875rem" }}
                        >
                          {instruction.distance}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ backgroundColor: "#e5e5e5" }} />

        {/* Route Summary */}
        <Box>
          <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
            <MapPin size={20} color="#f97316" />
            <Typography
              variant="h6"
              sx={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "#171717",
              }}
            >
              Route Summary
            </Typography>
          </Box>
          <Box
            component="ol"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              pl: 0,
              listStyle: "none",
            }}
          >
            {trip.route.map((location, index) => (
              <Box
                component="li"
                key={index}
                sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
              >
                <Box
                  sx={{
                    mt: 0.75,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    flexShrink: 0,
                    borderRadius: "50%",
                    border: "1px solid #d4d4d4",
                    backgroundColor: "#ffffff",
                    color: "#404040",
                    fontSize: "0.75rem",
                  }}
                >
                  {index + 1}
                </Box>
                <Typography
                  sx={{ pt: 0.5, color: "#404040", fontSize: "1rem" }}
                >
                  {location}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ backgroundColor: "#e5e5e5" }} />

        {/* Activities */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              mb: 1.5,
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#171717",
            }}
          >
            Activities
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {trip.activities.map((activity, index) => (
              <Chip
                key={index}
                label={activity}
                sx={{
                  border: "1px solid #e5e5e5",
                  backgroundColor: "#f5f5f5",
                  color: "#404040",
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Notes */}
        {trip.notes.length > 0 && (
          <>
            <Divider sx={{ backgroundColor: "#e5e5e5" }} />

            <Box>
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "#171717",
                }}
              >
                Notes
              </Typography>
              <Typography
                sx={{
                  borderRadius: 2,
                  border: "1px solid #fcd34d",
                  backgroundColor: "#fef3c7",
                  p: 2,
                  color: "#404040",
                  fontSize: "1rem",
                }}
              >
                {trip.notes}
              </Typography>
            </Box>
          </>
        )}

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 1.5,
            pt: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: "#d4d4d4",
              color: "#171717",
              textTransform: "none",
              "&:hover": {
                borderColor: "#a3a3a3",
                backgroundColor: "#fafafa",
              },
            }}
          >
            Close
          </Button>
          <Box sx={{ display: "flex", gap: 1.5 }}>
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
        </Box>
      </Box>
    </Modal>
  );
}
