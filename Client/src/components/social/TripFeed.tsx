// TripFeed.tsx
import { useState } from 'react';
import TripPost from './TripPost';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { Explore } from '@mui/icons-material';

interface Trip {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    isFollowing: boolean;
  };
  location: string;
  duration: string;
  description: string;
  activities: string[];
  images: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
}

const initialTrips: Trip[] = [
  {
    id: "1",
    user: {
      name: "Sarah Anderson",
      username: "sarahwanders",
      avatar: "https://i.pravatar.cc/150?img=1",
      isFollowing: false,
    },
    location: "Bali, Indonesia",
    duration: "7 days",
    description: "Paradise found! 🌴 The beaches here are absolutely stunning. Spent the week exploring hidden temples, surfing at sunrise, and trying the most amazing local food. Can't wait to come back!",
    activities: ["Beach", "Surfing", "Temple Visits", "Food", "Photography"],
    images: [
      "https://images.unsplash.com/photo-1579077926357-365f07b70b01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwdmFjYXRpb258ZW58MXx8fHwxNzYyNzcyMzIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1552912470-ee2e96439539?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwbWFya2V0JTIwc3RyZWV0fGVufDF8fHx8MTc2MjcyOTQxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1740156248740-746aadebd01d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBsYW5kc2NhcGUlMjB0cmF2ZWx8ZW58MXx8fHwxNzYyNzY1MjE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
    likes: 342,
    comments: 28,
    isLiked: false,
    isSaved: false,
  },
  {
    id: "2",
    user: {
      name: "Marcus Chen",
      username: "marcusontheroad",
      avatar: "https://i.pravatar.cc/150?img=12",
      isFollowing: true,
    },
    location: "Swiss Alps, Switzerland",
    duration: "5 days",
    description: "The mountains are calling and I must go! 🏔️ Incredible hiking through the Alps. The views were breathtaking at every turn. Met some amazing fellow hikers along the way.",
    activities: ["Hiking", "Mountain Climbing", "Photography", "Camping", "Nature"],
    images: [
      "https://images.unsplash.com/photo-1603741614953-4187ed84cc50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZyUyMGFkdmVudHVyZXxlbnwxfHx8fDE3NjI3NzM0Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1740156248740-746aadebd01d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBsYW5kc2NhcGUlMjB0cmF2ZWx8ZW58MXx8fHwxNzYyNzY1MjE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
    likes: 521,
    comments: 43,
    isLiked: true,
    isSaved: true,
  },
  {
    id: "3",
    user: {
      name: "Emma Rodriguez",
      username: "emmatravels",
      avatar: "https://i.pravatar.cc/150?img=5",
      isFollowing: false,
    },
    location: "Tokyo, Japan",
    duration: "10 days",
    description: "Tokyo is a perfect blend of traditional and modern! 🗾 From ancient temples to neon-lit streets, every corner has something new to discover. The food scene here is unmatched!",
    activities: ["City Tour", "Food", "Shopping", "Culture", "Photography", "Night Life"],
    images: [
      "https://images.unsplash.com/photo-1652176862396-99e525e9f87b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMHRyYXZlbHxlbnwxfHx8fDE3NjI4MjIwNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
    likes: 789,
    comments: 67,
    isLiked: false,
    isSaved: false,
  },
  {
    id: "4",
    user: {
      name: "David Kim",
      username: "adventuredavid",
      avatar: "https://i.pravatar.cc/150?img=8",
      isFollowing: false,
    },
    location: "Sahara Desert, Morocco",
    duration: "4 days",
    description: "An unforgettable journey through the endless dunes 🐪 Watching the sunset over the Sahara was a spiritual experience. Spent nights under the stars and days exploring ancient kasbahs.",
    activities: ["Desert Safari", "Camping", "Camel Riding", "Stargazing", "Photography", "Adventure"],
    images: [
      "https://images.unsplash.com/photo-1598696737715-1e7741c387ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBhZHZlbnR1cmV8ZW58MXx8fHwxNzYyNzM3MDQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1740156248740-746aadebd01d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBsYW5kc2NhcGUlMjB0cmF2ZWx8ZW58MXx8fHwxNzYyNzY1MjE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1579077926357-365f07b70b01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwdmFjYXRpb258ZW58MXx8fHwxNzYyNzcyMzIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
    likes: 456,
    comments: 34,
    isLiked: true,
    isSaved: false,
  },
];

export function TripFeed() {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);

  const handleLike = (id: string) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) =>
        trip.id === id
          ? {
              ...trip,
              isLiked: !trip.isLiked,
              likes: trip.isLiked ? trip.likes - 1 : trip.likes + 1,
            }
          : trip
      )
    );
  };

  const handleSave = (id: string) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) =>
        trip.id === id ? { ...trip, isSaved: !trip.isSaved } : trip
      )
    );
  };

  const handleFollow = (username: string) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) =>
        trip.user.username === username
          ? {
              ...trip,
              user: { ...trip.user, isFollowing: !trip.user.isFollowing },
            }
          : trip
      )
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={1}
        sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Container maxWidth="md">
          <Toolbar sx={{ gap: 1.5 }}>
            <Explore color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h6" component="h1">
              TripShare
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Feed */}
      <Container maxWidth="md" sx={{ py: 3 }}>
        {trips.map((trip) => (
          <TripPost
            key={trip.id}
            trip={trip}
            onLike={handleLike}
            onSave={handleSave}
            onFollow={handleFollow}
          />
        ))}
      </Container>
    </Box>
  );
}