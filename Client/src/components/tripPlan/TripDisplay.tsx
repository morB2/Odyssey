import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  CardMedia,
  Typography,
  Chip,
  Divider,
  Button,
  Box,
  Stack,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { MapPin, Navigation, ExternalLink } from "lucide-react";

interface Location {
  name: string;
  lat: number;
  lon: number;
  note?: string;
}

interface RouteData {
  title?: string;
  description?: string;
  ordered_route: Location[];
  mode: string;
  instructions?: string[];
  google_maps_url: string;
  activities?: string[];
}

interface TripDisplayProps {
  data: {
    success: boolean;
    route: RouteData;
  };
}

export function TripDisplay({ data }: TripDisplayProps) {
  if (!data?.route) return <Typography>No route data to display</Typography>;

  const { title, description, ordered_route, mode, instructions = [], google_maps_url, activities = [] } = data.route;

  const orange = "#ff9800";
  const lightOrange = "#fff3e0";
  const borderOrange = "#ffe0b2";

  return (
    <Card
      sx={{
        maxWidth: 800,
        mx: "auto",
        boxShadow: 4,
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${borderOrange}`,
      }}
    >
      {/* Header Image */}
      <CardMedia
        component="img"
        height="240"
        image="https://images.unsplash.com/photo-1627853585647-55e46555d259?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
        alt="Trip Cover"
        sx={{ objectFit: "cover" }}
      />

      {/* Header */}
      <CardHeader
        sx={{ bgcolor: lightOrange, borderBottom: `1px solid ${borderOrange}` }}
        title={
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: orange }}>
                {title || "Untitled Trip"}
              </Typography>
              {description && (
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {description}
                </Typography>
              )}
            </Box>
            <Chip
              icon={<Navigation size={16} color={orange} />}
              label={mode}
              sx={{
                borderColor: orange,
                color: orange,
                bgcolor: "#fff",
                textTransform: "capitalize",
                fontWeight: 500,
              }}
              variant="outlined"
            />
          </Stack>
        }
      />

      {/* Content */}
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 4, bgcolor: "#fffaf3" }}>
        {/* Route Stops */}
        <Box>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1, color: orange }}
          >
            <MapPin size={18} color={orange} />
            Route Stops
          </Typography>
          <List disablePadding>
            {ordered_route.map((location, index) => (
              <ListItem key={index} sx={{ alignItems: "flex-start", pl: 0 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: orange,
                    color: "#fff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    mr: 2,
                    flexShrink: 0,
                    fontWeight: "bold",
                  }}
                >
                  {index + 1}
                </Box>
                <ListItemText
                  primary={location.name}
                  secondary={location.note}
                  primaryTypographyProps={{ fontWeight: 500 }}
                  secondaryTypographyProps={{ color: "text.secondary" }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Travel Instructions */}
        {instructions.length > 0 && (
          <>
            <Divider sx={{ borderColor: borderOrange }} />
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: orange }}>
                Travel Instructions
              </Typography>
              <List sx={{ pl: 2, listStyleType: "decimal" }}>
                {instructions.map((instruction, index) => (
                  <ListItem key={index} sx={{ display: "list-item", pl: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {instruction}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}

        {/* Activities */}
        {activities.length > 0 && (
          <>
            <Divider sx={{ borderColor: borderOrange }} />
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: orange }}>
                Activities
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {activities.map((activity, index) => (
                  <Chip
                    key={index}
                    label={activity}
                    variant="outlined"
                    sx={{
                      borderColor: orange,
                      color: orange,
                      bgcolor: "#fff",
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </>
        )}
      </CardContent>

      {/* Footer */}
      <Divider sx={{ borderColor: borderOrange }} />
      <CardActions sx={{ justifyContent: "center", p: 2, bgcolor: lightOrange }}>
        <Button
          variant="contained"
          href={google_maps_url}
          target="_blank"
          startIcon={<ExternalLink size={18} />}
          sx={{
            backgroundColor: orange,
            "&:hover": { backgroundColor: "#fb8c00" },
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          Open in Google Maps
        </Button>
      </CardActions>
    </Card>
  );
}
