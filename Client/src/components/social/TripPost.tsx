
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
    createTheme,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    Divider,
    ThemeProvider
} from '@mui/material';
import {
    Favorite,
    FavoriteBorder,
    ChatBubbleOutline,
    BookmarkBorder,
    Bookmark,
    ChevronLeft,
    ChevronRight,
    Close,
} from '@mui/icons-material';
import { useState } from 'react';
import axios from 'axios';
const theme = createTheme({
    palette: {
        primary: {
            main: '#eb7c31ff',
        },
    },
});

interface Trip {
    id: string;
    user: {
        id:string,
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
    comments?: object[];
    isLiked: boolean;
    isSaved: boolean;
    detailedData?: any;
    optimizedRoute?: any;
    currentUserId?: string;
}

interface TripPostProps {
    trip: Trip;
    onLike: (id: string) => void;
    onSave: (id: string) => void;
    onFollow: (username: string) => void;
}

export default function TripPost({ trip, onLike, onSave, onFollow }: TripPostProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogImageIndex, setDialogImageIndex] = useState(0);
    console.log(trip);
    const handleCardClick = (e: any) => {
        // Don't open dialog if clicking on interactive elements
        if (e.target.closest('button') || e.target.closest('a')) {
            return;
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const nextDialogImage = () => {
        setDialogImageIndex((prev) =>
            prev === trip.images.length - 1 ? 0 : prev + 1
        );
    };

    const prevDialogImage = () => {
        setDialogImageIndex((prev) =>
            prev === 0 ? trip.images.length - 1 : prev - 1
        );
    };
    const postLike = async () => {
        // Implement like functionality here
        let response;
        try {
            if (!trip.isLiked) {
                response = await axios.post(`http://localhost:3000/likes/${trip.id}/like`, {
                    userId: trip.currentUserId, // Replace with actual user ID

                });
            }
            else {
                response = await axios.post(`http://localhost:3000/likes/${trip.id}/unlike`, {
                    userId: trip.currentUserId, // Replace with actual user ID
                });
            }
            console.log('Like toggled:', response.data);
        }
        catch (error) {
            console.error('Error toggling like:', error);
        }
    };
    const postSave = async () => {
        // Implement like functionality here
        let response;
        try {
            if (!trip.isSaved) {
                response = await axios.post(`http://localhost:3000/saves/${trip.id}/save`, {
                    userId: trip.currentUserId, // Replace with actual user ID

                });
            }
            else {
                response = await axios.post(`http://localhost:3000/saves/${trip.id}/unsave`, {
                    userId: trip.currentUserId, // Replace with actual user ID
                });
            }
            console.log('save toggled:', response.data);
        }
        catch (error) {
            console.error('Error toggling save:', error);
        }
    };
    const postFollow = async () => {
        // Implement follow functionality here
        let response;   
        try{
              response = await axios.post(`http://localhost:3000/follow/${trip.user.id}/follow`, {
                    userId: trip.currentUserId, // Replace with actual user ID

                }); 
        }
        catch(error){
            console.log(error);
        }
    }

    return (
        <>
            <ThemeProvider theme={theme}>
                <Card
                    sx={{
                        maxWidth: { xs: '100%', sm: 600, md: 700 },
                        mx: 'auto',
                        mb: 3,
                        borderRadius: '16px',
                        boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        }
                    }}
                    onClick={handleCardClick}
                >
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFollow(trip.user.username);
                                    postFollow();
                                }}
                            >
                                {trip.user.isFollowing ? 'Following' : 'Follow'}
                            </Button>
                        </Box>
                    </CardContent>

                    {/* Image Carousel */}
                    <Box position="relative" sx={{ bgcolor: 'grey.200' }}>
                        <Box sx={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
                            {trip.images && trip.images.map((image, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        minWidth: '100%',
                                        aspectRatio: '4/3',
                                        scrollSnapAlign: 'start',
                                    }}
                                >
                                    <img
                                        src={image}
                                        alt={`${trip.location} - ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block',
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>

                        {trip.images && trip.images.length > 1 && (
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(index);
                                        }}
                                        aria-label={`Go to image ${index + 1}`}
                                        sx={{
                                            height: 6,
                                            width: index === currentImageIndex ? 24 : 6,
                                            borderRadius: 3,
                                            border: 'none',
                                            bgcolor:
                                                index === currentImageIndex
                                                    ? '#ff6b35'
                                                    : 'rgba(255, 255, 255, 0.6)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                bgcolor:
                                                    index === currentImageIndex
                                                        ? '#ff6b35'
                                                        : 'rgba(255, 255, 255, 0.8)',
                                            },
                                        }}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* Actions */}
                    <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                        <Box display="flex" gap={2}>
                            <Box display="flex" alignItems="center">
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        postLike();
                                        onLike(trip.id);
                                    }}
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
                                <Typography variant="body2">{trip.comments?.length}</Typography>
                            </Box>
                        </Box>
                        <IconButton
                            onClick={(e) => {
                                e.stopPropagation();
                                onSave(trip.id);
                                postSave();
                            }}
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

                {/* Detailed Trip Dialog */}
                <Dialog
                    open={dialogOpen}
                    onClose={handleCloseDialog}
                    maxWidth="lg"
                    fullWidth
                >
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h5" fontWeight={600}>
                                {trip.detailedData?.title || trip.location}
                            </Typography>
                            <IconButton onClick={handleCloseDialog} edge="end">
                                <Close />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={3}>
                            {/* Left Side - Images */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                {trip.images && <Box position="relative" sx={{ bgcolor: 'grey.200', borderRadius: 2, overflow: 'hidden' }}>
                                    <img
                                        src={trip.images[dialogImageIndex]}
                                        alt={`${trip.location} - ${dialogImageIndex + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '400px',
                                            objectFit: 'cover',
                                            display: 'block',
                                        }}
                                    />

                                    {trip.images.length > 1 && (
                                        <>
                                            <IconButton
                                                onClick={prevDialogImage}
                                                sx={{
                                                    position: 'absolute',
                                                    left: 8,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                                                    color: 'white',
                                                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                                                }}
                                            >
                                                <ChevronLeft />
                                            </IconButton>
                                            <IconButton
                                                onClick={nextDialogImage}
                                                sx={{
                                                    position: 'absolute',
                                                    right: 8,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                                                    color: 'white',
                                                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                                                }}
                                            >
                                                <ChevronRight />
                                            </IconButton>

                                            <Box
                                                position="absolute"
                                                bottom={12}
                                                left="50%"
                                                sx={{ transform: 'translateX(-50%)' }}
                                                display="flex"
                                                gap={0.75}
                                            >
                                                {trip.images && trip.images.map((_, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            height: 6,
                                                            width: index === dialogImageIndex ? 24 : 6,
                                                            borderRadius: 3,
                                                            bgcolor: index === dialogImageIndex ? '#ff6b35' : 'rgba(255, 255, 255, 0.6)',
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </>
                                    )}
                                </Box>}
                            </Grid>

                            {/* Right Side - Trip Details */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box>
                                    <Typography variant="body1" paragraph>
                                        {trip.description || trip.description}
                                    </Typography>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Optimized Route */}
                                    {trip.optimizedRoute && (
                                        <>
                                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                                Itinerary
                                            </Typography>
                                            {trip.optimizedRoute.ordered_route?.map((stop: any, index: number) => (
                                                <Box key={index} sx={{ mb: 2, pl: 2, borderLeft: '3px solid #ff6b35' }}>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {index + 1}. {stop.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {stop.note}
                                                    </Typography>
                                                </Box>
                                            ))}

                                            <Divider sx={{ my: 2 }} />

                                            {/* Instructions */}
                                            {trip.optimizedRoute.instructions && (
                                                <>
                                                    <Typography variant="h6" gutterBottom fontWeight={600}>
                                                        Directions
                                                    </Typography>
                                                    {trip.optimizedRoute.instructions.map((instruction: string, index: number) => (
                                                        <Typography key={index} variant="body2" paragraph>
                                                            • {instruction}
                                                        </Typography>
                                                    ))}
                                                    <Divider sx={{ my: 2 }} />
                                                </>
                                            )}
                                        </>
                                    )}

                                    {/* Activities */}
                                    <Typography variant="h6" gutterBottom fontWeight={600}>
                                        Activities
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                        {(trip.activities || trip.activities).map((activity: string, index: number) => (
                                            <Chip
                                                key={index}
                                                label={activity}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>

                                    {/* Google Maps Link */}
                                    {trip.optimizedRoute?.google_maps_url && (
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            href={trip.optimizedRoute.google_maps_url}
                                            target="_blank"
                                            sx={{ mt: 2 }}
                                        >
                                            Open in Google Maps
                                        </Button>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </DialogContent>
                </Dialog>
            </ThemeProvider>
        </>
    );
}