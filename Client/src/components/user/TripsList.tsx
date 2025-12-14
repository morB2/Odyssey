import { useState, useEffect, useRef, useCallback } from "react";
import type { Trip } from "./types";
import type { Collection } from "./types";
import TripPost from "../social/TripPost";
import { Box, Tabs, Tab, Typography, Grid, Skeleton, Card, CircularProgress } from "@mui/material";
import { User, Heart, Bookmark, Layers } from "lucide-react";
import { CollectionsList } from "../collections/CollectionsList";
import { useTranslation } from 'react-i18next';
import { adaptCommentsForUI } from "../../utils/tripAdapters";
import { getTrips, getLikedTrips, getSavedTrips } from "../../services/profile.service";
import { getCollectionsByUser } from "../../services/collection.service";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/userStore";
import { EditTripModal } from "./EditTripModal";

interface TripsListProps {
  profileId: string;
  activeTab: "my-trips" | "liked" | "saved" | "collections";
  onTabChange: (tab: "my-trips" | "liked" | "saved" | "collections") => void;
  onDelete: (tripId: string) => Promise<void>;
  onTripUpdated?: (updatedTrip: Trip) => void; // NEW: callback when trip is updated
  onCollectionCreate?: () => void;
  onCollectionEdit?: (collection: Collection) => void;
  onCollectionDelete?: (collectionId: string) => Promise<void>;
}

const TRIPS_PER_PAGE = 12;

const normalizeTrips = (data: unknown): Trip[] => {
  if (Array.isArray(data)) return data;
  const trips = (data as { trips?: Trip[] })?.trips;
  return Array.isArray(trips) ? trips : [];
};

export function TripsList({
  profileId,
  activeTab,
  onTabChange,
  onDelete,
  onCollectionCreate,
  onCollectionEdit,
  onCollectionDelete
}: TripsListProps) {

  const sentinelRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const storeUser = useUserStore((s) => s.user);
  const id = storeUser?._id || "";

  // Internal state for data management
  const [trips, setTrips] = useState<Trip[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Edit modal state - managed internally
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
const isOwner = profileId === id;
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

  // Fetch data function - extracted so it can be called externally
  const fetchForTab = useCallback(async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setPage(1);

    try {
      if (activeTab === "saved" && !isOwner) return;

      if (activeTab === "collections") {
        setCollectionsLoading(true);
        try {
          const res = await getCollectionsByUser(profileId);
          const cols = res.collections || res;
          setCollections(cols || []);
        } catch {
          toast.error(t("collection.loadFailed") || "Failed to load collections");
        } finally {
          setCollectionsLoading(false);
        }
      } else {
        let data: unknown = null;
        if (activeTab === "my-trips") {
          data = await getTrips(profileId, 1, TRIPS_PER_PAGE);
        } else if (activeTab === "liked") {
          data = await getLikedTrips(profileId, 1, TRIPS_PER_PAGE);
        } else {
          data = await getSavedTrips(profileId, 1, TRIPS_PER_PAGE);
        }

        const response = data as any;
        const tripsData = normalizeTrips(response.trips || response);
        setTrips(tripsData);
        setPage(1);
        setHasMore(response.pagination?.hasMore ?? true);
      }
    } catch (error) {
      toast.error(t("profile.failedToLoadTrips") || "Failed to load trips");
    } finally {
      setLoading(false);
    }
  }, [activeTab, profileId, isOwner, t]);

  // Fetch data when tab or profileId changes
  useEffect(() => {
    fetchForTab();
  }, [fetchForTab]);

  // Handle trip update - update in local state
  const handleTripUpdate = (updatedTrip: Trip) => {
    setTrips((prev) => prev.map((t) =>
      (t.id === updatedTrip.id || t._id === updatedTrip._id)
        ? { ...t, ...updatedTrip }
        : t
    ));
  };

  // Handle trip save from modal
  const handleSaveTrip = (updatedTrip?: Trip) => {
    setEditingTrip(null);
    if (updatedTrip) {
      handleTripUpdate(updatedTrip);
    }
    toast.success(t('profilePage.tripUpdatedSuccessfully'));
  };

  // Load more trips (infinite scroll)
  const loadMoreTrips = async () => {
    if (loadingMore || !hasMore || activeTab === "collections") return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      let data: unknown = null;

      if (activeTab === "my-trips") {
        data = await getTrips(profileId, nextPage, TRIPS_PER_PAGE);
      } else if (activeTab === "liked") {
        data = await getLikedTrips(profileId, nextPage, TRIPS_PER_PAGE);
      } else {
        data = await getSavedTrips(profileId, nextPage, TRIPS_PER_PAGE);
      }

      const response = data as any;
      const newTrips = normalizeTrips(response.trips || response);

      setTrips((prev) => [...prev, ...newTrips]);
      setPage(nextPage);
      setHasMore(response.pagination?.hasMore ?? false);
    } catch {
      toast.error(t("profile.failedToLoadMore") || "Failed to load more trips");
    } finally {
      setLoadingMore(false);
    }
  };

  /** Infinite scroll observer */
  useEffect(() => {
    if (!hasMore || loadingMore || activeTab === "collections") return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadMoreTrips();
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, loadingMore, activeTab, page]);

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

  // Handle trip deletion
  const handleDeleteTrip = async (tripId: string) => {
    await onDelete(tripId);
    // Remove from local state
    setTrips((prev) => prev.filter((t) => t.id !== tripId && t._id !== tripId));
  };

  return (
    <Box sx={{ backgroundColor: 'white' }}>

      {/* Tabs */}
      <Box sx={{ mb: 5, borderBottom: "1px solid #e5e5e5" }}>
        <Tabs
          value={availableTabs.findIndex(t => t.key === activeTab)}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{

            // 👇 center tabs when they don't overflow
            "& .MuiTabs-flexContainer": {
              justifyContent: "center",
            },

            "& .MuiTabs-indicator": {
              backgroundColor: "#f97316",
              height: 2
            }
          }}
        >

          {availableTabs.map(t => (
            <Tab key={t.key} label={t.label} icon={t.icon} iconPosition="start" sx={tabStyle} />
          ))}
        </Tabs>
      </Box>


      {/* Loading State */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map(i => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
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
            {trips.map(trip => {
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={trip._id ?? trip.id}>
                  <TripPost
                    trip={{
                      currentUserId: id || '',
                      _id: String(trip._id || trip.id || ''),
                      user: {
                        _id: trip.user._id,
                        firstName: trip.user.firstName,
                        lastName: trip.user.lastName,
                        avatar: trip.user.avatar,
                        isFollowing: trip.user.isFollowing,
                      },
                      title: trip.title,
                      duration: '',
                      description: trip.description,
                      activities: trip.activities,
                      images: trip.images,
                      views: trip.views,
                      likes: trip.likes,
                      comments: adaptCommentsForUI(trip.comments || [], t),
                      isLiked: trip.isLiked,
                      isSaved: trip.isSaved,
                      optimizedRoute: trip.optimizedRoute
                    }}
                    onEdit={() => setEditingTrip(trip)}
                    onDelete={() => handleDeleteTrip(String(trip._id || trip.id))}
                  />
                </Grid>
              );
            })}
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

      {/* Edit Trip Modal */}
      <EditTripModal
        trip={editingTrip}
        isOpen={!!editingTrip}
        onClose={() => setEditingTrip(null)}
        onSave={handleSaveTrip}
      />
    </Box>
  );
}
