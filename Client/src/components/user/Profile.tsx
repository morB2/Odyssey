import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Paper, Typography } from "@mui/material";
import { ProfileHeader } from "./ProfileHeader";
import { TripsList } from "./TripsList";
import { ChangePasswordModal } from "./EditProfileModal";
import { EditTripModal } from "./EditTripModal";
import type { Trip, UserProfile } from "./types";
import { getProfile, getTrips, getLikedTrips, getSavedTrips, deleteTrip as svcDeleteTrip } from "../../services/profile.service";
import { useUserStore } from "../../store/userStore";
import api from "../../services/httpService";
import Navbar from "../general/Navbar";

// Shared styles
const containerStyle = { minHeight: "100vh", display: "flex", flexDirection: "column" };
const paperStyle = { p: 4, borderRadius: 4, bgcolor: "background.paper" };
const errorBoxStyle = { mb: 2, p: 2, border: "1px solid #fdecea", backgroundColor: "#fff5f5", borderRadius: 1 };
const guestUser = { id: "", firstName: "Guest", lastName: "guest", email: "", avatar: "" };

// Helper function to normalize trips response
const normalizeTrips = (data: unknown): Trip[] => {
  if (Array.isArray(data)) return data;
  const trips = (data as { trips?: Trip[] })?.trips;
  return Array.isArray(trips) ? trips : [];
};

export default function Profile() {
  const storeUser = useUserStore((s) => s.user);
  const storeToken = useUserStore((s) => s.token);
  const setUserStore = useUserStore((s) => s.setUser);
  const params = useParams();
  const viewedUserId = (params.userId as string) || undefined;
  const profileId = viewedUserId || storeUser?._id || "";
  const isOwner = Boolean(storeUser?._id && viewedUserId ? storeUser._id === viewedUserId : !viewedUserId);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<"my-trips" | "liked" | "saved">("my-trips");

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [userRes, tripsRes] = await Promise.all([
          getProfile(profileId, storeToken || undefined).catch((e) => ({ success: false, error: String(e) })),
          getTrips(profileId as string, storeToken || undefined).catch((e) => ({ success: false, error: String(e) })),
        ]);

        if (!mounted) return;
        if (!userRes || !userRes.success) throw new Error(userRes?.error || "Failed to load user");

        setUser(userRes.user);
        setTrips(normalizeTrips(tripsRes));
      } catch (e) {
        if (!mounted) return;
        setError(String(e instanceof Error ? e.message : e));
      }
    }

    loadData();
    return () => { mounted = false; };
  }, [storeUser, storeToken, profileId]);

  useEffect(() => {
    if (!isOwner) setActiveTab("my-trips");
  }, [isOwner]);

  useEffect(() => {
    let mounted = true;
    async function fetchForTab() {
      try {
        if (activeTab === "saved" && !isOwner) return;

        let data: unknown = null;
        if (activeTab === "my-trips") {
          data = await getTrips(profileId as string, storeToken || undefined);
        } else if (activeTab === "liked") {
          data = await getLikedTrips(profileId as string, storeToken || undefined);
        } else {
          data = await getSavedTrips(profileId as string, storeToken || undefined);
        }

        if (mounted) setTrips(normalizeTrips(data));
      } catch (e) {
        console.error("failed to load trips", e);
      }
    }

    fetchForTab();
    return () => { mounted = false; };
  }, [activeTab, profileId, storeToken, isOwner]);

  const handleSaveTrip = (updatedTrip: Trip) => {
    setTrips((prev) => prev.map((t) => t.id === updatedTrip.id || t._id === updatedTrip._id ? { ...t, ...updatedTrip } : t));
    setEditingTrip(null);
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
    } catch (e) {
      console.error("Failed to delete trip", e);
      alert(String(e instanceof Error ? e.message : e));
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
  };

  return (
    <>
      <Navbar />
      <Box sx={containerStyle}>
        <Paper elevation={3} sx={paperStyle}>
          <ProfileHeader user={user || guestUser} isOwner={isOwner} onEditClick={() => isOwner && setIsEditModalOpen(true)} />

          {error && (
            <Box sx={errorBoxStyle}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}

          <Box sx={{ mt: 4 }}>
            <Box sx={{ mt: 3 }}>
              <TripsList trips={trips} activeTab={activeTab} onTabChange={setActiveTab} onTripClick={() => { }} setTrips={setTrips} onEdit={(trip) => setEditingTrip(trip)} onDelete={(tripId) => handleDeleteTrip(tripId)} isOwner={isOwner} />
            </Box>
          </Box>
        </Paper>

        <ChangePasswordModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user || guestUser} onAvatarSaved={handleAvatarSaved} />
        <EditTripModal trip={editingTrip} isOpen={!!editingTrip} onClose={() => setEditingTrip(null)} onSave={handleSaveTrip} setTrips={setTrips} />
      </Box>
    </>
  );
}
