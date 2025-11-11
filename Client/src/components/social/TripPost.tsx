import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  BookmarkBorder,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useState } from 'react';

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

interface TripPostProps {
  trip: Trip;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onFollow: (username: string) => void;
}

export function TripPost({ trip, onLike, onSave, onFollow }: TripPostProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === trip.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? trip.images.length - 1 : prev - 1
    );
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto' }}>
      {/* Header */}
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar src={trip.user.avatar} alt={trip.user.name}>
              {trip.user.name[0]}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight={500}>
                {trip.user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{trip.user.username}
              </Typography>
            </Box>
          </Box>
          <Button
            variant={trip.user.isFollowing ? 'outlined' : 'contained'}
            size="small"
            onClick={() => onFollow(trip.user.username)}
          >
            {trip.user.isFollowing ? 'Following' : 'Follow'}
          </Button>
        </Box>
      </CardContent>

      {/* Image Carousel */}
      <Box position="relative" sx={{ aspectRatio: '4/3', bgcolor: 'grey.200' }}>
        <img
          src={trip.images[currentImageIndex]}
          alt={`${trip.location} - ${currentImageIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />

        {trip.images.length > 1 && (
          <>
            <IconButton
              onClick={prevImage}
              aria-label="Previous image"
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                },
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              onClick={nextImage}
              aria-label="Next image"
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                },
              }}
            >
              <ChevronRight />
            </IconButton>

            {/* Image indicators */}
            <Box
              position="absolute"
              bottom={12}
              left="50%"
              sx={{ transform: 'translateX(-50%)' }}
              display="flex"
              gap={0.75}
            >
              {trip.images.map((_, index) => (
                <Box
                  key={index}
                  component="button"
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`Go to image ${index + 1}`}
                  sx={{
                    height: 6,
                    width: index === currentImageIndex ? 24 : 6,
                    borderRadius: 3,
                    border: 'none',
                    bgcolor:
                      index === currentImageIndex
                        ? 'primary.main'
                        : 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor:
                        index === currentImageIndex
                          ? 'primary.main'
                          : 'rgba(255, 255, 255, 0.8)',
                    },
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </Box>

      {/* Actions */}
      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
        <Box display="flex" gap={2}>
          <Box display="flex" alignItems="center">
            <IconButton
              onClick={() => onLike(trip.id)}
              aria-label={trip.isLiked ? 'Unlike' : 'Like'}
              color={trip.isLiked ? 'primary' : 'default'}
            >
              {trip.isLiked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <Typography variant="body2">{trip.likes}</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <IconButton aria-label="Comments">
              <ChatBubbleOutline />
            </IconButton>
            <Typography variant="body2">{trip.comments}</Typography>
          </Box>
        </Box>
        <IconButton
          onClick={() => onSave(trip.id)}
          aria-label={trip.isSaved ? 'Unsave' : 'Save'}
          color={trip.isSaved ? 'primary' : 'default'}
        >
          {trip.isSaved ? <Bookmark /> : <BookmarkBorder />}
        </IconButton>
      </CardActions>

      {/* Content */}
      <CardContent>
        <Box mb={1.5}>
          <Typography variant="h6" gutterBottom>
            {trip.location}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {trip.duration}
          </Typography>
        </Box>
        <Typography variant="body1" paragraph>
          {trip.description}
        </Typography>

        {/* Hashtags from activities */}
        <Box display="flex" flexWrap="wrap" gap={1}>
          {trip.activities.map((activity, index) => (
            <Chip
              key={index}
              label={`#${activity.toLowerCase().replace(/\s+/g, '')}`}
              size="small"
              clickable
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

// Example usage
export default function App() {
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      user: {
        name: 'Sarah Johnson',
        username: 'sarahtravels',
        avatar: 'https://i.pravatar.cc/150?img=1',
        isFollowing: false,
      },
      location: 'Santorini, Greece',
      duration: '7 days',
      description:
        'An unforgettable week exploring the stunning white-washed buildings and blue domes of Santorini. The sunsets were absolutely magical! 🌅',
      activities: ['Beach', 'Photography', 'Wine Tasting', 'Hiking'],
      images: [
        'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
        'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
        'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800',
      ],
      likes: 234,
      comments: 18,
      isLiked: false,
      isSaved: false,
    },
  ]);

  const handleLike = (id: string) => {
    setTrips(
      trips.map((trip) =>
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
    setTrips(
      trips.map((trip) =>
        trip.id === id ? { ...trip, isSaved: !trip.isSaved } : trip
      )
    );
  };

  const handleFollow = (username: string) => {
    setTrips(
      trips.map((trip) =>
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
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      {trips.map((trip) => (
        <TripPost
          key={trip.id}
          trip={trip}
          onLike={handleLike}
          onSave={handleSave}
          onFollow={handleFollow}
        />
      ))}
    </Box>
  );
}