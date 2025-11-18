import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Paper, Typography } from "@mui/material";
import { ProfileHeader } from "./ProfileHeader";
import { TripsList } from "./TripsList";
import { ChangePasswordModal } from "./EditProfileModal";
import { EditTripModal } from "./EditTripModal";
import type { Trip, UserProfile } from "./types";
import { useUserStore } from "../../store/userStore";
// Navbar intentionally not rendered inside this view

const BASE_URL = "http://localhost:3000";

export default function Profile() {
  const storeUser = useUserStore((s) => s.user);
  const storeToken = useUserStore((s) => s.token);
  const params = useParams();
  const viewedUserId = (params.userId as string) || undefined;
  const profileId = viewedUserId || storeUser?._id || "";
  const isOwner = Boolean(
    storeUser?._id && viewedUserId
      ? storeUser._id === viewedUserId
      : !viewedUserId
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // selectedTrip removed — we don't use a dedicated details modal anymore
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<"my-trips" | "liked" | "saved">(
    "my-trips"
  );

  // comments adaptation removed — server now returns comment objects suitable for the client

  useEffect(() => {
    // When the logged-in user changes, load their profile and initial trips.
    let mounted = true;
    async function loadData() {
      try {
        // load the profile for the requested user (or current user if no param)
        const [userRes, tripsRes] = await Promise.all([
          fetch(`${BASE_URL}/profile/${profileId}`, {
            headers: storeToken
              ? { Authorization: `Bearer ${storeToken}` }
              : undefined,
          })
            .then((r) => r.json())
            .catch((e) => ({ success: false, error: String(e) })),
          fetch(`${BASE_URL}/profile/${profileId}/trips`, {
            headers: storeToken
              ? { Authorization: `Bearer ${storeToken}` }
              : undefined,
          })
            .then((r) => r.json())
            .catch((e) => ({ success: false, error: String(e) })),
        ]);

        if (!mounted) return;
        if (!userRes.success)
          throw new Error(userRes.error || "Failed to load user");

        setUser(userRes.user);

        const rawTrips = Array.isArray(tripsRes)
          ? tripsRes
          : Array.isArray(tripsRes?.trips)
          ? tripsRes.trips
          : [];

        setTrips(rawTrips);
      } catch (e) {
        if (!mounted) return;
        setError(String(e instanceof Error ? e.message : e));
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [storeUser, storeToken, profileId]);

  useEffect(() => {
    // Fetch trips for the currently active tab (my-trips / liked / saved)
    let mounted = true;
    async function fetchForTab() {
      // Use the profileId (viewed user) for fetching tab data
      let url = "";
      switch (activeTab) {
        case "my-trips":
          url = `${BASE_URL}/profile/${profileId}/trips`;
          break;
        case "liked":
          url = `${BASE_URL}/likes/${profileId}`;
          break;
        case "saved":
          url = `${BASE_URL}/saves/${profileId}`;
          break;
        default:
          url = `${BASE_URL}/profile/${profileId}/trips`;
          break;
      }

      try {
        const res = await fetch(url, {
          headers: storeToken
            ? { Authorization: `Bearer ${storeToken}` }
            : undefined,
        });
        const data = await res.json();

        const rawTrips = Array.isArray(data)
          ? data
          : Array.isArray(data?.trips)
          ? data.trips
          : [];
        if (mounted) setTrips(rawTrips);
      } catch (e) {
        console.error("failed to load trips", e);
      }
    }

    fetchForTab();
    return () => {
      mounted = false;
    };
  }, [activeTab, profileId, storeToken]);

  // password modal replaces previous edit modal

  const handleSaveTrip = (updatedTrip: Trip) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === updatedTrip.id || t._id === updatedTrip._id
          ? { ...t, ...updatedTrip }
          : t
      )
    );
    setEditingTrip(null);
  };

  const handleDeleteTrip = (tripId: string) => {
    (async () => {
      try {
        const userId = storeUser?._id;
        const token = storeToken;
        if (!userId) throw new Error("Not authenticated");

        const res = await fetch(
          `${BASE_URL}/profile/${userId}/trips/${tripId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const body = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(
            body?.error || body?.message || "Failed to delete trip"
          );

        // remove locally on success
        setTrips((prev) => prev.filter((t) => t.id !== tripId));
      } catch (e) {
        console.error("Failed to delete trip", e);
        alert(String(e instanceof Error ? e.message : e));
      }
    })();
  };

  return (
    // <Navbar />
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* <Container maxWidth="lg" sx={{ py: 6 }}> */}
      <Paper
        elevation={3}
        sx={{ p: 4, borderRadius: 4, bgcolor: "background.paper" }}
      >
        <ProfileHeader
          user={
            user
              ? user
              : {
                  id: "",
                  firstName: "Guest",
                  lastName: "guest",
                  email: "",
                  avatar: "",
                }
          }
          isOwner={isOwner}
          onEditClick={() => isOwner && setIsEditModalOpen(true)}
          onAvatarSaved={(u) => setUser(u)}
        />

        {error && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              border: "1px solid #fdecea",
              backgroundColor: "#fff5f5",
              borderRadius: 1,
            }}
          >
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <Box sx={{ mt: 3 }}>
            <TripsList
              trips={trips}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onTripClick={() => {}}
              setTrips={setTrips}
              onEdit={(trip) => setEditingTrip(trip)}
              onDelete={(tripId) => handleDeleteTrip(tripId)}
            />
          </Box>
        </Box>
      </Paper>
      {/* </Container> */}

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* TripDetailsModal removed — details can be viewed in Edit modal or inline components */}

      <EditTripModal
        trip={editingTrip}
        isOpen={!!editingTrip}
        onClose={() => setEditingTrip(null)}
        onSave={handleSaveTrip}
        setTrips={setTrips}
      />
    </Box>
  );
}
