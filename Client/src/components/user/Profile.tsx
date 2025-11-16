import { useState, useEffect, useCallback } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { ProfileHeader } from "./ProfileHeader";
import { TripsList } from "./TripsList";
import { EditProfileModal } from "./EditProfileModal";
// TripDetailsModal removed; details are shown in-line or via Edit modal now
import { EditTripModal } from "./EditTripModal";
import type { Trip, UserProfile, Comment } from "./types";
import { useUserStore } from "../../store/userStore";
import Navbar from "../general/Navbar";

const BASE_URL = "http://localhost:3000";

// (server raw trip helper removed; we normalize responses with normalizeServerTrip)

// We'll fetch the real user and trips from the server using the profile APIs.
// If no logged-in user is available in the store, the component falls back to a guest view.

export default function Profile() {
  const storeUser = useUserStore((s) => s.user);
  const storeToken = useUserStore((s) => s.token);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // selectedTrip removed — we don't use a dedicated details modal anymore
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<"my-trips" | "liked" | "saved">(
    "my-trips"
  );

  const adaptComments = useCallback((apiComments: any[]): Comment[] => {
    // eslint-disable-next-line no-console
    console.log("in comments:\n", apiComments);

    return (Array.isArray(apiComments) ? apiComments : []).map((c: any) => {
      const date = new Date(c.createdAt);
      const time = date.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        id: c._id,
        user: {
          name: `${c.user.firstName} ${c.user.lastName}`,
          username: ` @${c.user.firstName.toLowerCase()}${c.user.lastName.toLowerCase()}`,
          avatar: c.user.avatar || "/default-avatar.png",
        },
        text: c.comment,
        timestamp: time,
      };
    });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeServerTrip = useCallback(
    (raw: any): Trip => {
      const userRaw = raw?.user || {};
      const userId =
        userRaw._id ||
        userRaw.id ||
        (typeof userRaw === "string" ? userRaw : "");
      const userName =
        userRaw.firstName && userRaw.lastName
          ? `${userRaw.firstName} ${userRaw.lastName}`
          : userRaw.fullName || userRaw.name || "";

      return {
        id: raw._id || raw.id || "",
        title: raw.title || raw.location || "",
        user: {
          id: userId,
          name: userName || String(userId),
          username: (userRaw.username || userName || "")
            .toLowerCase()
            .replace(/\s+/g, ""),
          avatar: userRaw.avatar || "/default-avatar.png",
          isFollowing: !!userRaw.isFollowing,
        },
        location: raw.title || raw.location || "",
        duration: raw.duration || "",
        description: raw.description || raw.summary || "",
        activities: Array.isArray(raw.activities) ? raw.activities : [],
        images: Array.isArray(raw.images) ? raw.images : [],
        likes: typeof raw.likes === "number" ? raw.likes : 0,
        comments: Array.isArray(raw.comments)
          ? adaptComments(raw.comments)
          : [],
        isLiked: !!raw.isLiked || !!raw.liked,
        isSaved: !!raw.isSaved,
        detailedData: raw.detailedData || null,
        optimizedRoute: raw.optimizedRoute || raw.optimized_route || null,
      } as Trip;
    },
    [adaptComments]
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
        console.log("in profile: \n", tripsRes);

        const rawTrips = Array.isArray(tripsRes)
          ? tripsRes
          : Array.isArray(tripsRes?.trips)
          ? tripsRes.trips
          : [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tripsData: Trip[] = rawTrips.map((t: any) =>
          normalizeServerTrip(t)
        );
        setTrips(tripsData);
      } catch (e) {
        if (!mounted) return;
        setError(String(e instanceof Error ? e.message : e));
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [storeUser, storeToken, normalizeServerTrip]);

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

        const rawTrips = Array.isArray(data)
          ? data
          : Array.isArray(data?.trips)
          ? data.trips
          : [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = rawTrips.map((t: any) => normalizeServerTrip(t));
        if (mounted) setTrips(mapped);
      } catch (e) {
        console.error("failed to load trips", e);
      }
    }

    fetchForTab();
    return () => {
      mounted = false;
    };
  }, [activeTab, storeUser, storeToken, normalizeServerTrip]);

  const handleSaveProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setIsEditModalOpen(false);
  };

  const handleSaveTrip = (updatedTrip: Trip) => {
    setTrips(trips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
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

      {/* TripDetailsModal removed — details can be viewed in Edit modal or inline components */}

      <EditTripModal
        trip={editingTrip}
        isOpen={!!editingTrip}
        onClose={() => setEditingTrip(null)}
        onSave={handleSaveTrip}
      />
    </Box>
  );
}
