import { useState, useEffect } from 'react';
import TripPost from './TripPost';
import { Container, Box } from '@mui/material';
import { fetchTrips } from '../../services/tripFeed.service';
import { type Comment, type Trip } from './types';
import Navbar from '../general/Navbar';
import TripFeedSkeleton from './TripFeedSkeleton';
import { useUserStore } from '../../store/userStore';
import { GuestWelcomeCard } from './GuestWelcomeCard';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allowGuest, setAllowGuest] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        const data = await fetchTrips(id || '', page, 5); // Limit 5 per page

        // Handle response structure (array or object with pagination)
        // Based on service check, it returns array or { trips, pagination }
        // Assuming array for now based on previous code, but let's be safe
        const fetchedTrips = Array.isArray(data) ? data : data.trips || [];

        const tripsData: Trip[] = fetchedTrips.map((trip: any) => ({
          ...trip,
          comments: adaptComments(trip.comments || []),
        }));

        if (tripsData.length < 5) {
          setHasMore(false);
        }

        setTrips(prev => page === 1 ? tripsData : [...prev, ...tripsData]);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
        toast.error(t('feed.failedToLoadTrips'));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchTripsData();
  }, [id, allowGuest, page]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
        !loading &&
        !loadingMore &&
        hasMore
      ) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, hasMore]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#bb986cff' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 }, px: { xs: 2, md: 3 } }}>
        {/* If user is not logged in and hasn't opted to view as guest, show the welcome card */}
        {!user && !allowGuest && (
          <GuestWelcomeCard onViewAsGuest={() => setAllowGuest(true)} />
        )}

        {loading && page === 1 ? (
          Array.from(new Array(3)).map((_, index) => (
            <TripFeedSkeleton key={index} />
          ))
        ) : (
          <>
            {trips.map((trip) => (
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
                  title: trip.title,
                  duration: '',
                  description: trip.description,
                  activities: trip.activities,
                  images: trip.images,
                  views: trip.views,
                  likes: trip.likes,
                  comments: trip.comments,
                  isLiked: trip.isLiked,
                  isSaved: trip.isSaved,
                  optimizedRoute: trip.optimizedRoute
                }}
              />
            ))}

            {loadingMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <TripFeedSkeleton />
              </Box>
            )}

            {!hasMore && trips.length > 0 && (
              <Box sx={{ textAlign: 'center', p: 2, color: 'white' }}>
                {t('feed.noMoreTrips')}
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
