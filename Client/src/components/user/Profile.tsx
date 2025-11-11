import { useState } from "react";
import {
  Container,
  Box,
  Paper,
} from "@mui/material";
import { ProfileHeader } from "./ProfileHeader";
import { TripsList } from "./TripsList";
import { EditProfileModal } from "./EditProfileModal";
import { TripDetailsModal } from "./TripDetailsModal";
import { EditTripModal } from "./EditTripModal";
import type { Trip, UserProfile } from "./types";

// Mock user data
const mockUser: UserProfile = {
  id: "1",
  fullName: "Sarah Mitchell",
  username: "@sarahtravels",
  email: "sarah.mitchell@example.com",
  profilePicture:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
};

// Mock trips data
const mockTrips: Trip[] = [
  {
    id: "1",
    title: "Mediterranean Coast Adventure",
    description:
      "A stunning journey along the coast with amazing views and local cuisine",
    images: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    ],
    route: ["Tel Aviv", "Haifa", "Akko", "Rosh Hanikra"],
    routeInstructions: [
      {
        step: 1,
        instruction:
          "Start your journey in Tel Aviv. Visit the beach and old Jaffa port.",
        mode: "car",
        distance: "0 km",
      },
      {
        step: 2,
        instruction: "Drive north on Highway 2 towards Haifa.",
        mode: "car",
        distance: "95 km",
      },
    ],
    mode: "car",
    visibility: "public",
    activities: [
      "Beach visit",
      "Historical sites",
      "Local food tour",
      "Sunset watching",
    ],
    notes:
      "Best time to visit is during spring or fall. Don’t miss the sunset at Rosh Hanikra!",
  },
  {
    id: "2",
    title: "Mountain Hiking Expedition",
    description: "Three days of hiking through breathtaking mountain trails",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    ],
    route: ["Base Camp", "Alpine Lake", "Summit Peak"],
    routeInstructions: [
      {
        step: 1,
        instruction:
          "Begin at Base Camp. Check your equipment and weather conditions.",
        mode: "walk",
        distance: "0 km",
      },
    ],
    mode: "walk",
    visibility: "private",
    activities: ["Hiking", "Camping", "Photography", "Wildlife watching"],
    notes: "Pack warm clothes even in summer. The weather changes quickly.",
  },
];

const mockLikedTrips: Trip[] = [
  {
    id: "4",
    title: "Coastal Road Trip",
    description: "Epic drive along the scenic coastline",
    images: [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
    ],
    route: ["Monterey", "Big Sur", "San Luis Obispo"],
    routeInstructions: [
      {
        step: 1,
        instruction: "Begin in Monterey. Visit the famous aquarium.",
        mode: "car",
        distance: "0 km",
      },
    ],
    mode: "car",
    visibility: "public",
    activities: ["Scenic drives", "Beach stops", "Wine tasting"],
    notes: "Take your time and enjoy the views!",
  },
];

const mockSavedTrips: Trip[] = [
  {
    id: "5",
    title: "Island Paradise Getaway",
    description: "Relax and unwind in tropical paradise",
    images: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800",
    ],
    route: ["Main Island", "North Bay", "Secret Beach"],
    routeInstructions: [
      {
        step: 1,
        instruction:
          "Arrive at Main Island port. Check into beachfront hotel.",
        mode: "walk",
        distance: "0 km",
      },
    ],
    mode: "walk",
    visibility: "public",
    activities: ["Snorkeling", "Beach relaxation", "Local cuisine"],
    notes: "Book accommodation in advance during peak season.",
  },
];

export default function Profile() {
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<"my-trips" | "liked" | "saved">(
    "my-trips"
  );

  const getCurrentTrips = () => {
    switch (activeTab) {
      case "my-trips":
        return trips;
      case "liked":
        return mockLikedTrips;
      case "saved":
        return mockSavedTrips;
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
          <ProfileHeader user={user} onEditClick={() => setIsEditModalOpen(true)} />

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
        user={user}
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
