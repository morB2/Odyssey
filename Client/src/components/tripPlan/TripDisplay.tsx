import React from "react";
import { Card, CardContent, CardHeader, CardActions, CardMedia, Typography, Chip, Divider, Button, Box, Stack, List, ListItem, ListItemText } from "@mui/material";
import { MapPin, Calendar, Navigation, ExternalLink } from "lucide-react";

interface Location { name: string; lat: number; lon: number; _id?: string; note?: string; }
interface OptimizedRoute { ordered_route: Location[]; mode: string; instructions: string[]; google_maps_url: string; }
interface Trip { user?: string; _id?: string; optimizedRoute: OptimizedRoute; activities?: string[]; notes?: string; createdAt?: string; updatedAt?: string; }
interface RouteData { title: string; description: string; ordered_route: Location[]; mode: string; instructions: string[]; google_maps_url: string; activities: string[]; }
interface TripDisplayProps { data: { success?: boolean; route?: RouteData; trip?: Trip; }; }

export function TripDisplay({ data }: TripDisplayProps) {
  const isRouteData = "route" in data && data.route; const isTripData = "trip" in data && data.trip;
  if (!isRouteData && !isTripData) return <Typography>No data to display</Typography>;
  const title = isRouteData ? data.route!.title : "Trip Details";
  const description = isRouteData ? data.route!.description : "";
  const orderedRoute = isRouteData ? data.route!.ordered_route : data.trip!.optimizedRoute.ordered_route;
  const mode = isRouteData ? data.route!.mode : data.trip!.optimizedRoute.mode;
  const instructions = isRouteData ? data.route!.instructions : data.trip!.optimizedRoute.instructions;
  const googleMapsUrl = isRouteData ? data.route!.google_maps_url : data.trip!.optimizedRoute.google_maps_url;
  const activities = isRouteData ? data.route!.activities : data.trip?.activities || [];
  const notes = isTripData ? data.trip!.notes : "";
  const createdAt = isTripData ? data.trip!.createdAt : "";

  return (
    <Card sx={{ maxWidth: 800, mx: "auto", boxShadow: 3, borderRadius: 3, overflow: "hidden" }}>
      <CardMedia component="img" height="240" image="https://images.unsplash.com/photo-1627853585647-55e46555d259?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWwlMjBhdml2JTIwc3Vuc2V0JTIwYmVhY2h8ZW58MXx8fHwxNzYyNjkwMjIxfDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Tel Aviv Beach Sunset" sx={{ objectFit: "cover", position: "relative" }} />
      <CardHeader title={<Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}><Box><Typography variant="h5" fontWeight="bold">{title}</Typography>{description && <Typography variant="body2" color="text.secondary" mt={0.5}>{description}</Typography>}</Box><Chip icon={<Navigation size={16} />} label={mode} color="primary" variant="outlined" sx={{ textTransform: "capitalize" }} /></Stack>} />
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Box>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}><MapPin size={18} />Route Stops</Typography>
          <List disablePadding>
            {orderedRoute.map((location, index) => (
              <ListItem key={index} sx={{ alignItems: "flex-start", pl: 0 }}>
                <Box sx={{ width: 28, height: 28, bgcolor: "primary.main", color: "primary.contrastText", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, mr: 2, flexShrink: 0 }}>{index + 1}</Box>
                <ListItemText primary={location.name} secondary={location.note} secondaryTypographyProps={{ color: "text.secondary" }} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider />

        {instructions && instructions.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>Travel Instructions</Typography>
            <List sx={{ pl: 2, listStyleType: "decimal" }}>
              {instructions.map((instruction, index) => (
                <ListItem key={index} sx={{ display: "list-item", pl: 1 }}>
                  <Typography variant="body2">{instruction}</Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {activities && activities.length > 0 && (
          <>
            <Divider />
            <Box>
              <Typography variant="h6" gutterBottom>Activities</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {activities.map((activity, index) => (<Chip key={index} label={activity} variant="outlined" />))}
              </Stack>
            </Box>
          </>
        )}

        {notes && (
          <>
            <Divider />
            <Box><Typography variant="h6" gutterBottom>Notes</Typography><Typography variant="body2" color="text.secondary">{notes}</Typography></Box>
          </>
        )}

        {createdAt && (
          <>
            <Divider />
            <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
              <Calendar size={16} />
              <Typography variant="caption">Created: {new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</Typography>
            </Stack>
          </>
        )}
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: "center", p: 2 }}>
        <Button variant="contained" color="primary" href={googleMapsUrl} target="_blank" startIcon={<ExternalLink size={18} />}>Open in Google Maps</Button>
      </CardActions>
    </Card>
  );
}
