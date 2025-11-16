import { useState, useEffect } from 'react';
import TripPost from './TripPost';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { Explore } from '@mui/icons-material';
import axios from 'axios';
import Navbar from '../general/Navbar';
import {type Trip,type Comment } from './types';
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

  if (loading) return <Typography align="center">Loading trips...</Typography>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 3 }}>
        {trips.map((trip) => (
          <TripPost
            key={trip.id}
            trip={trip}
            setTrips={setTrips}
          />
        ))}
      </Container>
    </Box>
  );
}
