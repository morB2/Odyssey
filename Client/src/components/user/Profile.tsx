import { useState, useEffect } from "react";
import { Container, Box, Paper, Typography } from "@mui/material";
import { ProfileHeader } from "./ProfileHeader";
import { TripsList } from "./TripsList";
import { EditProfileModal } from "./EditProfileModal";
import { TripDetailsModal } from "./TripDetailsModal";
import { EditTripModal } from "./EditTripModal";
import type { Trip, UserProfile } from "./types";
import { useUserStore } from "../../store/userStore";

// We'll fetch the real user and trips from the server using the profile APIs.
// If no logged-in user is available in the store, the component falls back to a guest view.

export default function Profile() {
  const storeUser = useUserStore((s) => s.user);
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
          fetch(`/profile/${userId}`).then((r) => r.json()),
          fetch(`/profile/${userId}/trips`).then((r) => r.json()),
        ]);

        if (!mounted) return;
        if (!userRes.success)
          throw new Error(userRes.error || "Failed to load user");
        if (!tripsRes.success)
          throw new Error(tripsRes.error || "Failed to load trips");

        setUser(userRes.user);
        const serverTrips = tripsRes.trips || [];
        // Map server Trip schema to client Trip shape used by the UI
        type ServerTrip = {
          _id?: string;
          id?: string;
          title?: string;
          description?: string;
          images?: string[];
          optimizedRoute?: {
            ordered_route?: Array<{ name?: string }>;
            instructions?: string[];
            mode?: string;
          };
          route?: string[];
          routeInstructions?: Array<{
            step?: number;
            instruction?: string;
            mode?: string;
            distance?: string;
          }>;
          mode?: string;
          visabilityStatus?: string;
          activities?: string[];
          notes?: string;
        };

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
                      : "train",
                  distance: "",
                }))
              : t.routeInstructions || [],
            mode: modeFromOptimized
              ? modeFromOptimized === "driving"
                ? "car"
                : modeFromOptimized === "walking"
                ? "walk"
                : "train"
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
    setTrips(trips.filter((t) => t.id !== tripId));
    setSelectedTrip(null);
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
                    fullName: "Guest",
                    username: "guest",
                    email: "",
                    profilePicture: "",
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
            fullName: "",
            username: "",
            email: "",
            profilePicture: "",
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
