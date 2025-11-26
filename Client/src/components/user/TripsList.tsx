import type { Trip } from "./types";
import TripPostAdapter from "./TripPostAdapter";
import { Box, Tabs, Tab, Typography, Grid } from "@mui/material";
import { User, Heart, Bookmark } from "lucide-react";

interface TripsListProps {
  trips: Trip[];
  activeTab: "my-trips" | "liked" | "saved";
  onTabChange: (tab: "my-trips" | "liked" | "saved") => void;
  onTripClick: (trip: Trip) => void;
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  onEdit: (trip: Trip) => void;
  onDelete: (tripId: string) => void;
  isOwner: boolean;
}

export function TripsList({ trips = [], activeTab, onTabChange, setTrips, onEdit, onDelete, isOwner }: TripsListProps) {
  const availableTabs = [
    { key: "my-trips", label: "My Trips", icon: <User size={20} /> },
    { key: "liked", label: "Liked", icon: <Heart size={20} /> },
    ...(isOwner ? [{ key: "saved", label: "Saved", icon: <Bookmark size={20} /> }] : []),
  ] as const;

  const tabStyle = { textTransform: "none", fontSize: "1rem", px: 3, py: 1.5, minHeight: "auto", color: "#525252", transition: "color 0.2s", "&:hover": { color: "#171717" }, "&.Mui-selected": { color: "#f97316" }, "& .MuiTab-iconWrapper": { mr: 1 } };

  const handleTabChange = (_: any, index: number) => onTabChange(availableTabs[index].key);

  return (
    <Box>
      <Box sx={{ mb: 5, borderBottom: "1px solid #e5e5e5" }}>
        <Tabs value={availableTabs.findIndex((t) => t.key === activeTab)} onChange={handleTabChange} centered sx={{ "& .MuiTabs-indicator": { backgroundColor: "#f97316", height: 2 } }}>
          {availableTabs.map((t) => <Tab key={t.key} label={t.label} icon={t.icon} iconPosition="start" sx={tabStyle} />)}
        </Tabs>
      </Box>

      {trips.length === 0 ? (
        <Box sx={{ border: "1px solid #e5e5e5", backgroundColor: "#fff", p: 6, textAlign: "center" }}>
          <Typography sx={{ color: "#737373", fontSize: "1rem" }}>No trips to display yet.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {trips.map((trip) => (
            <Grid key={trip.id} sx={{ width: { xs: "100%", sm: "50%", md: "33.333%" } }}>
              <TripPostAdapter trip={trip} setTrips={setTrips} onEdit={() => onEdit(trip)} onDelete={() => onDelete(trip._id)} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
