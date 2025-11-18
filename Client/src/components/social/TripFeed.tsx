
import { useState, useEffect } from 'react';
import TripPost from './TripPost';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { Explore } from '@mui/icons-material';
import axios from 'axios';
import Navbar from '../general/Navbar';

interface Comment {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  reactionsAggregated?: Record<string, number>;
}
interface Trip {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    isFollowing: boolean;
  };
  title: string;
  description: string;
  activities: string[];
  images: string[];
  likes: number;
  comments?: Comment[];
  isLiked: boolean;
  isSaved: boolean;
  optimizedRoute?: any;
  notes?: string;
}
interface StoredUser {
  state: {
    user: {
      _id: string;
      avatar: string;
      // add other properties if needed
    };
  };
}

function adaptComments(apiComments: any[]): Comment[] {
  return apiComments.map((c) => {
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
      timestamp: time, // use formatted time instead of raw timestamp
      reactionsAggregated: c.reactionsAggregated || {}, // Include aggregated reactions
    };
  });
}


export function TripFeed() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const userStorage = localStorage.getItem('user-storage');
  const id: string | undefined = userStorage
    ? (JSON.parse(userStorage) as StoredUser).state.user._id
    : undefined;
  // Fetch trips from backend
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/trips/${id}`); // Your API endpoint
        const tripsData: Trip[] = res.data.map((trip: any) => ({
          ...trip,
          comments: adaptComments(trip.comments || []),
        }));
        setTrips(tripsData);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  // const handleLike = (id: string) => {
  //   setTrips((prevTrips) =>
  //     prevTrips.map((trip) =>
  //       trip._id === id
  //         ? {
  //           ...trip,
  //           isLiked: !trip.isLiked,
  //           likes: trip.isLiked ? trip.likes - 1 : trip.likes + 1,
  //         }
  //         : trip
  //     )
  //   );
  // };

  // const handleSave = (id: string) => {
  //   setTrips((prevTrips) =>
  //     prevTrips.map((trip) =>
  //       trip._id === id ? { ...trip, isSaved: !trip.isSaved } : trip
  //     )
  //   );
  // };

  // const handleFollow = (_id: string) => {
  //   setTrips((prevTrips) =>
  //     prevTrips.map((trip) =>
  //       trip.user._id === _id
  //         ? { ...trip, user: { ...trip.user, isFollowing: !trip.user.isFollowing } }
  //         : trip
  //     )
  //   );
  // };

  if (loading) return <Typography align="center">Loading trips...</Typography>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 3 }}>
        {trips.map((trip) => (
          <TripPost
            key={trip._id}
            trip={{
              currentUserId: id || '',
              id: trip._id,
              user: {
                id: trip.user._id,
                name: `${trip.user.firstName} ${trip.user.lastName}`,
                username: trip.user.firstName.toLowerCase() + trip.user.lastName.toLowerCase(),
                avatar: trip.user.avatar,
                isFollowing: trip.user.isFollowing,
              },
              location: trip.title, // or you can adjust if you have separate location
              duration: '', // you can calculate duration if needed
              description: trip.description,
              activities: trip.activities,
              images: trip.images,
              likes: trip.likes,
              comments: trip.comments,
              isLiked: trip.isLiked,
              isSaved: trip.isSaved,
              optimizedRoute: trip.optimizedRoute
            }}
            // onLike={handleLike}
            // onSave={handleSave}
            // onFollow={handleFollow}
          />
        ))}
      </Container>
    </Box>
  );
}
