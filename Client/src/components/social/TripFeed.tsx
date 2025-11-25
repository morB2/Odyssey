import { useState, useEffect } from 'react';
import TripPost from './TripPost';
import { Container, Box } from '@mui/material';
import { fetchTrips } from '../../services/tripFeed.service';
import { type Comment, type Trip } from './types';
import Navbar  from '../general/Navbar';
import TripFeedSkeleton from './TripFeedSkeleton';
import { useUserStore } from '../../store/userStore';
import GuestWelcomeCard from './GuestWelcomeCard';
import { toast } from 'react-toastify';

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
  const [allowGuest, setAllowGuest] = useState(false);
  const { user } = useUserStore();
  const id: string | undefined = user?._id;
  // Fetch trips from backend
  useEffect(() => {
    // Only fetch when we have a logged-in user or the visitor has opted-in to view as guest
    if (!id && !allowGuest) {
      setLoading(false);
      return;
    }

    const fetchTripsData = async () => {
      try {
        setLoading(true);
        const data = await fetchTrips(id || '');
        const tripsData: Trip[] = data.map((trip: any) => ({
          ...trip,
          comments: adaptComments(trip.comments || []),
        }));
        setTrips(tripsData);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
        toast.error("Failed to load trips. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchTripsData();
  }, [id, allowGuest]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#bb986cff' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 3 }}>
        {/* If user is not logged in and hasn't opted to view as guest, show the welcome card */}
        {!user && !allowGuest && (
          <GuestWelcomeCard onViewAsGuest={() => setAllowGuest(true)} />
        )}
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
