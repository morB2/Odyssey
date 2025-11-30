import type { Trip } from "./types";
import TripPostAdapter from "./TripPostAdapter";
import { Box, Tabs, Tab, Typography, Grid, Skeleton, Card, CircularProgress } from "@mui/material";
import { User, Heart, Bookmark } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';

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
  loadingMore?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function TripsList({ trips = [], activeTab, onTabChange, setTrips, onEdit, onDelete, isOwner, loading = false, loadingMore = false, onLoadMore, hasMore = true }: TripsListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const availableTabs = [
    { key: "my-trips", label: t('profile.myTrips'), icon: <User size={20} /> },
    { key: "liked", label: t('profile.likedTrips'), icon: <Heart size={20} /> },
    ...(isOwner ? [{ key: "saved", label: t('profile.savedTrips'), icon: <Bookmark size={20} /> }] : []),
  ] as const;

  const tabStyle = { textTransform: "none", fontSize: "1rem", px: 3, py: 1.5, minHeight: "auto", color: "#525252", transition: "color 0.2s", "&:hover": { color: "#171717" }, "&.Mui-selected": { color: "#f97316" }, "& .MuiTab-iconWrapper": { mr: 1 } };

  const handleTabChange = (_: any, index: number) => onTabChange(availableTabs[index].key as "my-trips" | "liked" | "saved");

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

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!onLoadMore || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loadingMore]);

  return (
    <Box>
      <Box sx={{ mb: 5, borderBottom: "1px solid #e5e5e5" }}>
        <Tabs value={availableTabs.findIndex((t) => t.key === activeTab)} onChange={handleTabChange} centered sx={{ "& .MuiTabs-indicator": { backgroundColor: "#f97316", height: 2 } }}>
          {availableTabs.map((t) => <Tab key={t.key} label={t.label} icon={t.icon} iconPosition="start" sx={tabStyle} />)}
        </Tabs>
      </Box>

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} sx={{ width: { xs: "100%", sm: "50%", md: "33.333%" } }}>
              <SkeletonCard />
            </Grid>
          ))}
        </Grid>
      ) : trips.length === 0 ? (
        <Box sx={{ border: "1px solid #e5e5e5", backgroundColor: "#fff", p: 6, textAlign: "center", borderRadius: 3 }}>
          <Typography sx={{ color: "#737373", fontSize: "1rem" }}>{t('profile.noTripsYet')}</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {trips.map((trip) => (
              <Box key={trip.id} sx={{ flex: '1 0 20%', minWidth: 150 }}>
                <TripPostAdapter trip={trip} onEdit={() => onEdit(trip)} onDelete={() => onDelete(trip._id)} />
              </Box>
            ))}
          </Box>

          {/* Sentinel element for infinite scroll */}
          {hasMore && <div ref={sentinelRef} style={{ height: '20px', margin: '20px 0' }} />}

          {/* Loading spinner */}
          {loadingMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} sx={{ color: '#f97316' }} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
