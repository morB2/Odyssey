import { useState, useEffect } from 'react';
import TripPost from './TripPost';
import { Container, Box } from '@mui/material';
import axios from 'axios';
import { Navbar } from '../general/Navbar';import { type Comment, type Trip } from './types';
import TripFeedSkeleton from './TripFeedSkeleton';

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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#bb986cff' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 3 }}>
        {loading ? (
          Array.from(new Array(3)).map((_, index) => (
            <TripFeedSkeleton key={index} />
          ))
        ) : (
          trips.map((trip) => (
            <TripPost
              key={trip._id}
              trip={{
                currentUserId: id || '',
                _id: trip._id,
                user: {
                  _id: trip.user._id,
                  firstName: trip.user.firstName,
                  lastName: trip.user.lastName,
                  avatar: trip.user.avatar,
                  isFollowing: trip.user.isFollowing,
                },
                title: trip.title, // or you can adjust if you have separate location
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
          ))
        )}
      </Container>
    </Box>
  );
}
