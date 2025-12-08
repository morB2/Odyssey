import type { Trip } from "./types";
import type { Collection } from "./types";
import TripPostAdapter from "./TripPostAdapter";
import { Box, Tabs, Tab, Typography, Grid, Skeleton, Card, CircularProgress } from "@mui/material";
import { User, Heart, Bookmark, Layers } from "lucide-react";
import { CollectionsList } from "../collections/CollectionsList";
import { useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';

interface TripsListProps {
  trips: Trip[];
  collections?: Collection[];
  collectionsLoading?: boolean;
  activeTab: "my-trips" | "liked" | "saved" | "collections";
  onTabChange: (tab: "my-trips" | "liked" | "saved" | "collections") => void;
  onTripClick: (trip: Trip) => void;
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  onEdit: (trip: Trip) => void;
  onDelete: (tripId: string) => void;
  isOwner: boolean;
  loading?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onCollectionCreate?: () => void;
  onCollectionEdit?: (collection: Collection) => void;
  onCollectionDelete?: (collectionId: string) => void;
}

export function TripsList({
  trips = [],
  collections = [],
  collectionsLoading = false,
  activeTab,
  onTabChange,
  onEdit,
  onDelete,
  isOwner,
  loading = false,
  loadingMore = false,
  onLoadMore,
  hasMore = true,
  onCollectionCreate,
  onCollectionEdit,
  onCollectionDelete
}: TripsListProps) {

  const sentinelRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  /** Tabs: include collections tab for all profiles; saved only for owner */
  const availableTabs = [
    { key: "my-trips", label: t('profile.myTrips'), icon: <User size={20} /> },
    { key: "liked", label: t('profile.likedTrips'), icon: <Heart size={20} /> },
    { key: "collections", label: t('profile.collections') || 'Collections', icon: <Layers size={20} /> },
    ...(isOwner ? [{ key: "saved", label: t('profile.savedTrips'), icon: <Bookmark size={20} /> }] : []),
  ] as const;

  const tabStyle = {
    textTransform: "none",
    fontSize: "1rem",
    px: 3,
    py: 1.5,
    minHeight: "auto",
    color: "#525252",
    transition: "color 0.2s",
    "&:hover": { color: "#171717" },
    "&.Mui-selected": { color: "#f97316" },
    "& .MuiTab-iconWrapper": { mr: 1 }
  };

  const handleTabChange = (_: any, index: number) =>
    onTabChange(availableTabs[index].key as "my-trips" | "liked" | "saved" | "collections");


  /** Skeleton Loading Card */
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

  /** Infinite scroll observer */
  useEffect(() => {
    if (!onLoadMore || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loadingMore]);


  return (
    <Box>

      {/* Tabs */}
      <Box sx={{ mb: 5, borderBottom: "1px solid #e5e5e5" }}>
        <Tabs
          value={availableTabs.findIndex(t => t.key === activeTab)}
          onChange={handleTabChange}
          centered
          sx={{ "& .MuiTabs-indicator": { backgroundColor: "#f97316", height: 2 } }}
        >
          {availableTabs.map(t => (
            <Tab key={t.key} label={t.label} icon={t.icon} iconPosition="start" sx={tabStyle} />
          ))}
        </Tabs>
      </Box>


      {/* Loading State */}
      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map(i => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <SkeletonCard />
            </Grid>
          ))}
        </Grid>

      ) : activeTab === 'collections' ? (
        <CollectionsList
          collections={collections || []}
          onCreate={onCollectionCreate || (() => { })}
          onEdit={onCollectionEdit || (() => { })}
          onDelete={onCollectionDelete || (() => { })}
          // Forward trip handlers so RouteViewer/TripPostAdapter can use them
          onTripEdit={onEdit}
          onTripDelete={onDelete}
          isOwner={isOwner}
          loading={collectionsLoading}
        />

      ) : trips.length === 0 ? (

        <Box sx={{ border: "1px solid #e5e5e5", backgroundColor: "#fff", p: 6, textAlign: "center", borderRadius: 3 }}>
          <Typography sx={{ color: "#737373", fontSize: "1rem" }}>{t('profile.noTripsYet')}</Typography>
        </Box>

      ) : (
        <>
          {/* Trip Grid */}
          <Grid container spacing={3}>
            {trips.map(trip => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={trip._id ?? trip.id}>
                <TripPostAdapter
                  trip={trip}
                  onEdit={() => onEdit(trip)}
                  onDelete={() => onDelete(trip._id)}
                />
              </Grid>
            ))}
          </Grid>

          {/* Infinite scroll sentinel */}
          {hasMore && <div ref={sentinelRef} style={{ height: 20, margin: "20px 0" }} />}

          {/* Bottom loader */}
          {loadingMore && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={40} sx={{ color: "#f97316" }} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
