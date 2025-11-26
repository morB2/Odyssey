import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Paper } from "@mui/material";
import { ProfileHeader } from "./ProfileHeader";
import { TripsList } from "./TripsList";
import { ChangePasswordModal } from "./EditProfileModal";
import { EditTripModal } from "./EditTripModal";
import type { Trip, UserProfile } from "./types";
import { getProfile, getTrips, getLikedTrips, getSavedTrips, deleteTrip as svcDeleteTrip } from "../../services/profile.service";
import { useUserStore } from "../../store/userStore";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';
// Navbar intentionally not rendered inside this view

const BASE_URL = "http://localhost:3000";
import api from "../../services/httpService";
import Navbar from "../general/Navbar";

// Shared styles
const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.5
  }
};
const paperStyle = { p: { xs: 2, md: 4 }, borderRadius: 4, bgcolor: "rgba(255, 255, 255, 0.95)", backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', position: 'relative', zIndex: 1 };
const guestUser = { id: "", firstName: "Guest", lastName: "guest", email: "", avatar: "" };

// Helper function to normalize trips response
const normalizeTrips = (data: unknown): Trip[] => {
  if (Array.isArray(data)) return data;
  const trips = (data as { trips?: Trip[] })?.trips;
  return Array.isArray(trips) ? trips : [];
};

export default function Profile() {
  const { t } = useTranslation();
  const storeUser = useUserStore((s) => s.user);
  const storeToken = useUserStore((s) => s.token);
  const setUserStore = useUserStore((s) => s.setUser);
  const params = useParams();
  const viewedUserId = (params.userId as string) || undefined;
  const profileId = viewedUserId || storeUser?._id || "";
  const isOwner = Boolean(storeUser?._id && viewedUserId ? storeUser._id === viewedUserId : !viewedUserId);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalTrips, setTotalTrips] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<"my-trips" | "liked" | "saved">("my-trips");

  const TRIPS_PER_PAGE = 12;

  // Initial load
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [userRes, tripsRes] = await Promise.all([
          getProfile(profileId, storeToken || undefined).catch((e) => ({ success: false, error: String(e) })),
          getTrips(profileId as string, storeToken || undefined, 1, TRIPS_PER_PAGE).catch((e) => ({ success: false, error: String(e) })),
        ]);

        if (!mounted) return;
        if (!userRes || !userRes.success) throw new Error(userRes?.error || t('general.error'));

        setUser(userRes.user);

        // Handle pagination response
        const tripsData = normalizeTrips(tripsRes.trips || tripsRes);
        setTrips(tripsData);
        setPage(1);
        setHasMore(tripsRes.pagination?.hasMore ?? true);
        setTotalTrips(tripsRes.pagination?.total ?? tripsData.length);
      } catch (e) {
        if (!mounted) return;
        const errorMsg = String(e instanceof Error ? e.message : e);
        toast.error(errorMsg);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, [storeUser, storeToken, profileId]);

  useEffect(() => {
    if (!isOwner) setActiveTab("my-trips");
  }, [isOwner]);

  // Fetch trips when tab changes
  useEffect(() => {
    let mounted = true;
    async function fetchForTab() {
      setTripsLoading(true);
      setPage(1);
      try {
        if (activeTab === "saved" && !isOwner) return;

        let data: unknown = null;
        if (activeTab === "my-trips") {
          data = await getTrips(profileId as string, storeToken || undefined, 1, TRIPS_PER_PAGE);
        } else if (activeTab === "liked") {
          data = await getLikedTrips(profileId as string, storeToken || undefined, 1, TRIPS_PER_PAGE);
        } else {
          data = await getSavedTrips(profileId as string, storeToken || undefined, 1, TRIPS_PER_PAGE);
        }

        if (mounted) {
          const response = data as any;
          const tripsData = normalizeTrips(response.trips || response);
          setTrips(tripsData);
          setPage(1);
          setHasMore(response.pagination?.hasMore ?? true);
          setTotalTrips(response.pagination?.total ?? tripsData.length);
        }
      } catch (e) {
        console.error("failed to load trips", e);
        toast.error("Failed to load trips");
      } finally {
        if (mounted) setTripsLoading(false);
      }
    }

    fetchForTab();
    return () => { mounted = false; };
  }, [activeTab, profileId, storeToken, isOwner]);

  const loadMoreTrips = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      let data: unknown = null;

      if (activeTab === "my-trips") {
        data = await getTrips(profileId as string, storeToken || undefined, nextPage, TRIPS_PER_PAGE);
      } else if (activeTab === "liked") {
        data = await getLikedTrips(profileId as string, storeToken || undefined, nextPage, TRIPS_PER_PAGE);
      } else {
        data = await getSavedTrips(profileId as string, storeToken || undefined, nextPage, TRIPS_PER_PAGE);
      }

      const response = data as any;
      const newTrips = normalizeTrips(response.trips || response);

      setTrips((prev) => [...prev, ...newTrips]);
      setPage(nextPage);
      setHasMore(response.pagination?.hasMore ?? false);
    } catch (e) {
      console.error("Failed to load more trips", e);
      toast.error("Failed to load more trips");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSaveTrip = (updatedTrip: Trip) => {
    setTrips((prev) => prev.map((t) => t.id === updatedTrip.id || t._id === updatedTrip._id ? { ...t, ...updatedTrip } : t));
    setEditingTrip(null);
    toast.success("Trip updated successfully!");
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const userId = storeUser?._id;
      const token = storeToken || undefined;
      if (!userId) throw new Error("Not authenticated");

      const res = await svcDeleteTrip(userId as string, tripId, token);
      const body = res as unknown as Record<string, unknown>;
      if (!body || (body.success === false && body["error"])) throw new Error((body["error"] as string) || (body["message"] as string) || "Failed to delete trip");

      setTrips((prev) => prev.filter((t) => t.id !== tripId && t._id !== tripId));
      toast.success("Trip deleted successfully!");
    } catch (e) {
      console.error("Failed to delete trip", e);
      const errorMsg = String(e instanceof Error ? e.message : e);
      toast.error(errorMsg);
    }
  };

  const handleAvatarSaved = (updatedUser: UserProfile) => {
    let newAvatar = updatedUser.avatar;
    if (newAvatar && !newAvatar.startsWith("http") && !newAvatar.startsWith("data:")) {
      const baseUrl = api.defaults.baseURL || "";
      newAvatar = `${baseUrl}${newAvatar.startsWith("/") ? "" : "/"}${newAvatar}`;
    }

    const userWithFullAvatar = { ...updatedUser, avatar: newAvatar };

    if (isOwner) {
      setUserStore(userWithFullAvatar, storeToken || undefined);
    }

    setUser((prev) => {
      if (!prev) return userWithFullAvatar;
      return { ...prev, ...userWithFullAvatar, followersCount: updatedUser.followersCount ?? prev.followersCount, followingCount: updatedUser.followingCount ?? prev.followingCount };
    });

    setTrips((prevTrips) => prevTrips.map((t) => {
      if (t.user && (t.user._id === updatedUser.id || t.user._id === (updatedUser as any)._id)) {
        return { ...t, user: { ...t.user, avatar: newAvatar } };
      }
      return t;
    }));

    toast.success("Profile updated successfully!");
  };

  return (
    <>
      <Navbar />
      <Box sx={containerStyle}>
        <Paper elevation={3} sx={paperStyle}>
          <ProfileHeader user={user || guestUser} isOwner={isOwner} onEditClick={() => isOwner && setIsEditModalOpen(true)} tripsCount={totalTrips} loading={loading} />

          <Box sx={{ mt: 4 }}>
            <TripsList
              trips={trips}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onTripClick={() => { }}
              setTrips={setTrips}
              onEdit={(trip) => setEditingTrip(trip)}
              onDelete={(tripId) => handleDeleteTrip(tripId)}
              isOwner={isOwner}
              loading={tripsLoading}
              loadingMore={loadingMore}
              onLoadMore={loadMoreTrips}
              hasMore={hasMore}
            />
          </Box>
        </Paper>

        <ChangePasswordModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user || guestUser} onAvatarSaved={handleAvatarSaved} />
        <EditTripModal trip={editingTrip} isOpen={!!editingTrip} onClose={() => setEditingTrip(null)} onSave={handleSaveTrip} setTrips={setTrips} />
      </Box>
    </>
  );
}
