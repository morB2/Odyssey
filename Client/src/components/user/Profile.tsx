import { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Container,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import ProfileHeader from "./ProfileHeader";
import TripCard from "./TripCard";
import EditProfileDialog from "./EditProfileDialog";
import ChangePasswordDialog from "./ChangePasswordDialog";
import TripEditDialog from "./TripEditDialog";

const BASE_URL = "http://localhost:3000";

export interface UserProfile {
  _id?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "user" | "admin";
  birthday?: string | null;
  preferences?: string[];
  createdAt?: string;
  bio?: string;
  location?: string;
  tripsCount?: number;
  followersCount?: number;
  followingCount?: number;
}

export interface TripItem {
  _id: string;
  title?: string;
  description?: string;
  image?: string;
  location?: string;
  likes?: number;
  comments?: number;
  optimizedRoute?: Record<string, unknown>;
  chosenTrip?: Record<string, unknown>;
  notes?: string;
  activities?: string[];
  visabilityStatus?: "private" | "public";
}

export interface OptimizedRoute {
  mode?: string;
  google_maps_url?: string;
  instructions?: string[];
  [key: string]: unknown;
}

export default function Profile({ userIdProp }: { userIdProp?: string }) {
  const [tab, setTab] = useState(0);
  const [user, setUser] = useState<UserProfile>({});
  const [trips, setTrips] = useState<TripItem[]>([]);

  // profile edit dialog state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formBirthday, setFormBirthday] = useState<string | null>(null);
  const [formAvatar, setFormAvatar] = useState("");

  // change password
  const [openChangePwd, setOpenChangePwd] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  // trip edit dialog
  const [openTripDialog, setOpenTripDialog] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripItem | null>(null);
  const [tripTitle, setTripTitle] = useState("");
  const [tripDescription, setTripDescription] = useState("");
  const [tripActivities, setTripActivities] = useState("");
  const [tripNotes, setTripNotes] = useState("");
  const [tripVisibility, setTripVisibility] = useState<"private" | "public">(
    "private"
  );
  const [tripOptimizedRouteText, setTripOptimizedRouteText] = useState("");
  const [tripMode, setTripMode] = useState<"driving" | "walking" | "transit">(
    "driving"
  );
  const [tripGoogleMapsUrl, setTripGoogleMapsUrl] = useState("");
  const [tripInstructionsText, setTripInstructionsText] = useState("");

  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity?: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const globalWindow = window as unknown as { __USER_ID?: string };
  const userId =
    userIdProp ||
    globalWindow.__USER_ID ||
    user._id ||
    "690c8a7c5e5fd174dbcacd5e";

  useEffect(() => {
    if (!userId) return;
    async function init() {
      try {
        const res = await fetch(`${BASE_URL}/profile/${userId}`);
        const data = await res.json();
        if (data.success) setUser(data.user || {});
      } catch (e) {
        console.error("loadProfile", e);
      }
      try {
        const res = await fetch(`${BASE_URL}/profile/${userId}/trips`);
        const data = await res.json();
        if (data.success) setTrips(data.trips || []);
      } catch (e) {
        console.error("loadTrips", e);
      }
    }
    init();
  }, [userId]);

  useEffect(() => {
    setFormFirstName(user.firstName || "");
    setFormLastName(user.lastName || "");
    setFormBirthday(user.birthday || null);
    setFormAvatar(user.avatar || "");
  }, [user]);

  async function saveProfile(updates: Partial<UserProfile>) {
    try {
      const res = await fetch(`${BASE_URL}/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setOpenEditDialog(false);
        setSnack({
          open: true,
          message: "Profile updated",
          severity: "success",
        });
      } else
        setSnack({
          open: true,
          message: data.error || "Failed",
          severity: "error",
        });
    } catch (e) {
      console.error("saveProfile", e);
      setSnack({
        open: true,
        message: "Error saving profile",
        severity: "error",
      });
    }
  }

  async function handleChangePassword() {
    if (!newPwd)
      return setSnack({
        open: true,
        message: "Enter a new password",
        severity: "error",
      });
    if (newPwd !== confirmPwd)
      return setSnack({
        open: true,
        message: "Passwords do not match",
        severity: "error",
      });
    try {
      const res = await fetch(`${BASE_URL}/profile/${userId}/changePassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPwd,
          newPassword: newPwd,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOpenChangePwd(false);
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
        setSnack({
          open: true,
          message: "Password changed",
          severity: "success",
        });
      } else
        setSnack({
          open: true,
          message: data.error || "Failed to change password",
          severity: "error",
        });
    } catch (e) {
      console.error("change password", e);
      setSnack({
        open: true,
        message: "Error changing password",
        severity: "error",
      });
    }
  }

  function openTripEditor(trip: TripItem) {
    setEditingTrip(trip);
    setTripTitle(trip.title || "");
    setTripDescription(trip.description || "");
    setTripActivities((trip.activities || []).join(", "));
    setTripNotes(trip.notes || "");
    setTripVisibility(trip.visabilityStatus || "private");
    try {
      setTripOptimizedRouteText(
        JSON.stringify(trip.optimizedRoute || {}, null, 2)
      );
    } catch {
      setTripOptimizedRouteText("");
    }
    const rawMode = (trip.optimizedRoute as OptimizedRoute)?.mode as
      | string
      | undefined;
    const safeMode =
      rawMode === "walking" || rawMode === "transit" ? rawMode : "driving";
    setTripMode(safeMode);
    setTripGoogleMapsUrl(
      (trip.optimizedRoute as OptimizedRoute)?.google_maps_url || ""
    );
    setTripInstructionsText(
      ((trip.optimizedRoute as OptimizedRoute)?.instructions || []).join("\n")
    );
    setOpenTripDialog(true);
  }

  async function saveTripEdits() {
    if (!editingTrip) return;
    const payload: Partial<TripItem> & { optimizedRoute?: OptimizedRoute } = {
      title: tripTitle,
      description: tripDescription,
      activities: tripActivities
        ? tripActivities
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      notes: tripNotes,
      visabilityStatus: tripVisibility,
    };
    try {
      const parsed = tripOptimizedRouteText
        ? JSON.parse(tripOptimizedRouteText)
        : null;
      if (parsed) payload.optimizedRoute = parsed;
      else
        payload.optimizedRoute = {
          mode: tripMode,
          google_maps_url: tripGoogleMapsUrl,
          instructions: tripInstructionsText
            ? tripInstructionsText
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        };
    } catch {
      payload.optimizedRoute = {
        mode: tripMode,
        google_maps_url: tripGoogleMapsUrl,
        instructions: tripInstructionsText
          ? tripInstructionsText
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };
    }

    try {
      const res = await fetch(
        `${BASE_URL}/profile/${userId}/trips/${editingTrip._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.success) {
        setTrips((t) =>
          t.map((x) => (x._id === editingTrip._id ? data.trip : x))
        );
        setOpenTripDialog(false);
        setEditingTrip(null);
        setSnack({ open: true, message: "Trip updated", severity: "success" });
      } else
        setSnack({
          open: true,
          message: data.error || "Failed to update trip",
          severity: "error",
        });
    } catch (e) {
      console.error("saveTripEdits", e);
      setSnack({
        open: true,
        message: "Error updating trip",
        severity: "error",
      });
    }
  }

  async function deleteTrip(id: string) {
    if (!confirm("Delete this trip?")) return;
    try {
      const res = await fetch(`${BASE_URL}/profile/${userId}/trips/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) setTrips((t) => t.filter((x) => x._id !== id));
      else
        setSnack({
          open: true,
          message: data.error || "Failed to delete",
          severity: "error",
        });
    } catch (e) {
      console.error("deleteTrip", e);
      setSnack({
        open: true,
        message: "Error deleting trip",
        severity: "error",
      });
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="lg">
        <ProfileHeader
          user={user}
          tripsCount={trips.length}
          onEdit={() => setOpenEditDialog(true)}
        />

        <EditProfileDialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          firstName={formFirstName}
          lastName={formLastName}
          email={user.email}
          birthday={formBirthday}
          avatar={formAvatar}
          setFirstName={setFormFirstName}
          setLastName={setFormLastName}
          setBirthday={setFormBirthday}
          setAvatar={setFormAvatar}
          onSave={() =>
            saveProfile({
              firstName: formFirstName,
              lastName: formLastName,
              birthday: formBirthday || undefined,
              avatar: formAvatar || undefined,
            })
          }
        />

        <ChangePasswordDialog
          open={openChangePwd}
          onClose={() => setOpenChangePwd(false)}
          currentPwd={currentPwd}
          setCurrentPwd={setCurrentPwd}
          newPwd={newPwd}
          setNewPwd={setNewPwd}
          confirmPwd={confirmPwd}
          setConfirmPwd={setConfirmPwd}
          onChange={handleChangePassword}
        />

        <TripEditDialog
          open={openTripDialog}
          onClose={() => {
            setOpenTripDialog(false);
            setEditingTrip(null);
          }}
          title={tripTitle}
          setTitle={setTripTitle}
          description={tripDescription}
          setDescription={setTripDescription}
          activities={tripActivities}
          setActivities={setTripActivities}
          notes={tripNotes}
          setNotes={setTripNotes}
          visibility={tripVisibility}
          setVisibility={setTripVisibility}
          optimizedRouteText={tripOptimizedRouteText}
          setOptimizedRouteText={setTripOptimizedRouteText}
          mode={tripMode}
          setMode={setTripMode}
          googleMapsUrl={tripGoogleMapsUrl}
          setGoogleMapsUrl={setTripGoogleMapsUrl}
          instructionsText={tripInstructionsText}
          setInstructionsText={setTripInstructionsText}
          onSave={saveTripEdits}
        />

        <Box sx={{ mt: 5 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
            <Tab label="Trips" />
            <Tab label="Saved" />
            <Tab label="Map" />
            <Tab label="Liked" />
          </Tabs>

          {tab === 0 && (
            <Box
              sx={{
                mt: 2,
                display: "grid",
                gap: 3,
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              }}
            >
              {trips.map((trip) => (
                <Box key={trip._id}>
                  <TripCard
                    trip={trip}
                    onEdit={openTripEditor}
                    onDelete={deleteTrip}
                  />
                </Box>
              ))}
            </Box>
          )}

          {tab === 1 && (
            <Box sx={{ mt: 2 }}>
              {" "}
              <Typography>Saved (coming)</Typography>{" "}
            </Box>
          )}

          {tab === 2 && (
            <Box
              sx={{
                mt: 4,
                height: 400,
                borderRadius: 3,
                bgcolor: "grey.100",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography color="text.secondary" fontWeight={500}>
                Map view coming soon
              </Typography>
            </Box>
          )}

          {tab === 3 && (
            <Box sx={{ mt: 2 }}>
              {" "}
              <Typography>Liked (coming)</Typography>{" "}
            </Box>
          )}
        </Box>

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          <Alert severity={snack.severity || "success"} sx={{ width: "100%" }}>
            {snack.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
