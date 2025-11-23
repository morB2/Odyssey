import { useState, useEffect, use } from 'react';
import TripPost from './TripPost';
import { Container, Box } from '@mui/material';
import { fetchTrips } from '../../services/tripFeed.service';
import Navbar from '../general/Navbar';
import { type Comment, type Trip } from './types';
import TripFeedSkeleton from './TripFeedSkeleton';
import {useUserStore} from '../../store/userStore'

// interface StoredUser {
//   state: {
//     user: {
//       _id: string;
//       avatar: string;
//       // add other properties if needed
//     };
//   };
// }

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

    // Safety checks for user data
    const firstName = c.user?.firstName || "Unknown";
    const lastName = c.user?.lastName || "User";

    return {
      id: c._id,
      user: {
        name: `${firstName} ${lastName}`,
        username: ` @${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        avatar: c.user?.avatar || "/default-avatar.png",
      },
      text: c.comment,
      timestamp: time, // use formatted time instead of raw timestamp
      reactionsAggregated: c.reactionsAggregated || {}, // Include aggregated reactions
      replies: c.replies ? adaptComments(c.replies) : [], // Recursively adapt replies
    };
  });
}


export function TripFeed() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const {user} = useUserStore();
  const id: string | undefined = user?._id;
  // Fetch trips from backend
  useEffect(() => {
    const fetchTripsData = async () => {
      try {
        const data = await fetchTrips(id || '');
        const tripsData: Trip[] = data.map((trip: any) => ({
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

    fetchTripsData();
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
