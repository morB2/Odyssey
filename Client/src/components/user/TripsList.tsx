import type { Trip } from "./types";
import TripPostAdapter from "./TripPostAdapter";
import { Box, Tabs, Tab, Typography, Grid, Skeleton, Card } from "@mui/material";
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
  loading?: boolean;
}

export function TripsList({ trips = [], activeTab, onTabChange, setTrips, onEdit, onDelete, isOwner, loading = false }: TripsListProps) {
  const availableTabs = [
    { key: "my-trips", label: "My Trips", icon: <User size={20} /> },
    { key: "liked", label: "Liked", icon: <Heart size={20} /> },
    ...(isOwner ? [{ key: "saved", label: "Saved", icon: <Bookmark size={20} /> }] : []),
  ] as const;

  const tabStyle = { textTransform: "none", fontSize: "1rem", px: 3, py: 1.5, minHeight: "auto", color: "#525252", transition: "color 0.2s", "&:hover": { color: "#171717" }, "&.Mui-selected": { color: "#f97316" }, "& .MuiTab-iconWrapper": { mr: 1 } };

  const handleTabChange = (_: any, index: number) => onTabChange(availableTabs[index].key);

  const SkeletonCard = () => (
    <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <Skeleton variant="rectangular" height={300} />
      <Box sx={{ p: 2 }}>
        <Skeleton width="60%" height={30} sx={{ mb: 1 }} />
        <Skeleton width="40%" height={20} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="80%" height={20} />
            <Skeleton width="50%" height={16} />
          </Box>
        </Box>
      </Box>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 5, borderBottom: "1px solid #e5e5e5" }}>
        <Tabs value={availableTabs.findIndex((t) => t.key === activeTab)} onChange={handleTabChange} centered sx={{ "& .MuiTabs-indicator": { backgroundColor: "#f97316", height: 2 } }}>
          {availableTabs.map((t) => <Tab key={t.key} label={t.label} icon={t.icon} iconPosition="start" sx={tabStyle} />)}
        </Tabs>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} item xs={12} sm={6} md={4}>
              <SkeletonCard />
            </Grid>
          ))}
        </Grid>
      ) : trips.length === 0 ? (
        <Box sx={{ border: "1px solid #e5e5e5", backgroundColor: "#fff", p: 6, textAlign: "center", borderRadius: 3 }}>
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
