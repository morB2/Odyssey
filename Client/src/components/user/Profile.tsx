import { useState, useEffect } from "react";
import { Container, Box, Paper, Typography } from "@mui/material";
import { ProfileHeader } from "./ProfileHeader";
import { TripsList } from "./TripsList";
import { EditProfileModal } from "./EditProfileModal";
import { TripDetailsModal } from "./TripDetailsModal";
import { EditTripModal } from "./EditTripModal";
import type { Trip, UserProfile, ServerTrip } from "./types";
import { useUserStore } from "../../store/userStore";
import Navbar from "../general/Navbar";

const BASE_URL = "http://localhost:3000";

// We'll fetch the real user and trips from the server using the profile APIs.
// If no logged-in user is available in the store, the component falls back to a guest view.

export default function Profile() {
  const storeUser = useUserStore((s) => s.user);
  const storeToken = useUserStore((s) => s.token);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<"my-trips" | "liked" | "saved">(
    "my-trips"
  );

  useEffect(() => {
    // When the logged-in user changes, load their profile and initial trips.
    let mounted = true;
    async function loadData() {
      if (!storeUser) {
        if (mounted) {
          setUser(null);
          setTrips([]);
        }
        return;
      }

      try {
        const userId = storeUser?._id;
        const [userRes, tripsRes] = await Promise.all([
          fetch(`${BASE_URL}/profile/${userId}`, {
            headers: { Authorization: `Bearer ${storeToken}` },
          })
            .then((r) => r.json())
            .catch((e) => ({ success: false, error: String(e) })),
          fetch(`${BASE_URL}/profile/${userId}/trips`, {
            headers: { Authorization: `Bearer ${storeToken}` },
          })
            .then((r) => r.json())
            .catch((e) => ({ success: false, error: String(e) })),
        ]);

        if (!mounted) return;
        if (!userRes.success)
          throw new Error(userRes.error || "Failed to load user");

        setUser(userRes.user);
        const serverTrips = Array.isArray(tripsRes)
          ? tripsRes
          : Array.isArray(tripsRes?.trips)
          ? tripsRes.trips
          : [];

        setTrips(serverTrips.map(mapTrip));
      } catch (e) {
        if (!mounted) return;
        setError(String(e instanceof Error ? e.message : e));
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [storeUser, storeToken]);

  useEffect(() => {
    // Fetch trips for the currently active tab (my-trips / liked / saved)
    let mounted = true;
    async function fetchForTab() {
      if (!storeUser) {
        if (mounted) setTrips([]);
        return;
      }

      let url = "";
      switch (activeTab) {
        case "my-trips":
          url = `${BASE_URL}/profile/${storeUser?._id}/trips`;
          break;
        case "liked":
          url = `${BASE_URL}/likes/${storeUser?._id}`;
          break;
        case "saved":
          url = `${BASE_URL}/saves/${storeUser?._id}`;
          break;
        default:
          url = `${BASE_URL}/profile/${storeUser?._id}/trips`;
          break;
      }

      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${storeToken}` },
        });
        const data = await res.json();

        const serverTrips = Array.isArray(data)
          ? data
          : Array.isArray(data?.trips)
          ? data.trips
          : [];

        if (mounted) setTrips(serverTrips.map(mapTrip));
      } catch (e) {
        console.error("failed to load trips", e);
      }
    }

    fetchForTab();
    return () => {
      mounted = false;
    };
  }, [activeTab, storeUser, storeToken]);

  const mapTrip = (t: ServerTrip): Trip => {
    const ordered = t.optimizedRoute?.ordered_route || [];
    const modeFromOptimized = t.optimizedRoute?.mode;
    return {
      id: t._id || t.id || "",
      title: t.title || "",
      description: t.description || "",
      images: t.images || [],
      route: ordered.length ? ordered.map((r) => r.name || "") : t.route || [],
      routeInstructions: t.optimizedRoute?.instructions
        ? t.optimizedRoute.instructions.map((ins, i) => ({
            step: i + 1,
            instruction: ins,
            mode:
              modeFromOptimized === "driving"
                ? "car"
                : modeFromOptimized === "walking"
                ? "walk"
                : "transit",
            distance: "",
          }))
        : t.routeInstructions || [],
      mode: modeFromOptimized
        ? modeFromOptimized === "driving"
          ? "car"
          : modeFromOptimized === "walking"
          ? "walk"
          : "transit"
        : t.mode || "car",
      visibility: t.visabilityStatus === "public" ? "public" : "private",
      activities: t.activities || [],
      notes: t.notes || "",
    } as Trip;
  };

  const handleSaveProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setIsEditModalOpen(false);
  };

  const handleSaveTrip = (updatedTrip: Trip) => {
    setTrips(trips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
    setEditingTrip(null);
    setSelectedTrip(updatedTrip);
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
        setSelectedTrip(null);
      } catch (e) {
        console.error("Failed to delete trip", e);
        alert(String(e instanceof Error ? e.message : e));
      }
    })();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 6 }}>
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
            onEditClick={() => setIsEditModalOpen(true)}
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
                onTripClick={setSelectedTrip}
              />
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Modals */}
      <EditProfileModal
        user={
          user ?? {
            id: "",
            firstName: "",
            lastName: "",
            email: "",
            avatar: "",
          }
        }
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
      />

      <TripDetailsModal
        trip={selectedTrip}
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        onEdit={() => setEditingTrip(selectedTrip)}
        onDelete={() => selectedTrip && handleDeleteTrip(selectedTrip.id)}
      />

      <EditTripModal
        trip={editingTrip}
        isOpen={!!editingTrip}
        onClose={() => setEditingTrip(null)}
        onSave={handleSaveTrip}
      />
    </Box>
  );
}
