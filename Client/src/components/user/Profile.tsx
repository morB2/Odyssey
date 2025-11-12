import { useState, useEffect } from "react";
import { Container, Box, Paper, Typography } from "@mui/material";
import { ProfileHeader } from "./ProfileHeader";
import { TripsList } from "./TripsList";
import { EditProfileModal } from "./EditProfileModal";
import { TripDetailsModal } from "./TripDetailsModal";
import { EditTripModal } from "./EditTripModal";
import type { Trip, UserProfile, ServerTrip } from "./types";
import { useUserStore } from "../../store/userStore";

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

  // load profile and trips from server
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const userId = storeUser?._id;
        if (!userId) {
          setError("Not signed in");
          return;
        }

        const [userRes, tripsRes] = await Promise.all([
          fetch(`${BASE_URL}/profile/${userId}`, {
            headers: {
              Authorization: `Bearer ${storeToken}`,
            },
          })
            .then((r) => r.json())
            .catch((e) => ({ success: false, error: String(e) })),
          fetch(`${BASE_URL}/profile/${userId}/trips`, {
            headers: {
              Authorization: `Bearer ${storeToken}`,
            },
          })
            .then((r) => r.json())
            .catch((e) => ({ success: false, error: String(e) })),
        ]);

        if (!mounted) return;
        if (!userRes.success)
          throw new Error(userRes.error || "Failed to load user");
        if (!tripsRes.success)
          throw new Error(tripsRes.error || "Failed to load trips");

        setUser(userRes.user);
        const serverTrips = tripsRes.trips || [];
        // Map server Trip schema to client Trip shape used by the UI
        const mapTrip = (t: ServerTrip): Trip => {
          const ordered = t.optimizedRoute?.ordered_route || [];
          const modeFromOptimized = t.optimizedRoute?.mode;
          return {
            id: t._id || t.id || "",
            title: t.title || "",
            description: t.description || "",
            images: t.images || [],
            route: ordered.length
              ? ordered.map((r) => r.name || "")
              : t.route || [],
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

        setTrips(serverTrips.map(mapTrip));
      } catch (e) {
        setError(String(e instanceof Error ? e.message : e));
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [storeUser]);

  const getCurrentTrips = () => {
    switch (activeTab) {
      case "my-trips":
        return trips;
      case "liked":
        return [];
      case "saved":
        return [];
      default:
        return trips;
    }
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
                trips={getCurrentTrips()}
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
