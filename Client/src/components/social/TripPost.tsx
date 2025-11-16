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
    ThemeProvider,
    TextField,
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
    Send,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import axios from 'axios';

const theme = createTheme({
    palette: {
        primary: {
            main: '#eb7c31ff',
        },
    },
});

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
    id: string;
    user: {
        id: string;
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
    comments?: Comment[]; // now typed
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

    // Comments state
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState<Comment[]>(trip.comments || []);
    const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);
    
    // Initialize reactions from trip comments
    const initializeReactions = (comments: Comment[]) => {
        const reactions: Record<string, Record<string, number>> = {};
        comments.forEach((comment) => {
            if (comment.id && comment.reactionsAggregated) {
                reactions[comment.id] = comment.reactionsAggregated;
            }
        });
        return reactions;
    };
    
    const [commentReactions, setCommentReactions] = useState<Record<string, Record<string, number>>>(
        initializeReactions(trip.comments || [])
    );
    
    // Update reactions when comments change (e.g., when trip data is updated)
    useEffect(() => {
        setCommentReactions(initializeReactions(trip.comments || []));
        setComments(trip.comments || []);
    }, [trip.comments]);

    console.log(trip);

    const handleCardClick = (e: any) => {
        // Don't open dialog if clicking on interactive elements
        if (
            e.target.closest('button') ||
            e.target.closest('a') ||
            e.target.closest('input') ||
            e.target.closest('textarea') ||
            e.target.getAttribute?.('role') === 'button'
        ) {
            return;
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const nextDialogImage = () => {
        setDialogImageIndex((prev) =>
            prev === (trip.images?.length ?? 1) - 1 ? 0 : prev + 1
        );
    };

    const prevDialogImage = () => {
        setDialogImageIndex((prev) =>
            prev === 0 ? (trip.images?.length ?? 1) - 1 : prev - 1
        );
    };

    const postLike = async () => {
        let response;
        try {
            if (!trip.isLiked) {
                response = await axios.post(`http://localhost:3000/likes/${trip.id}/like`, {
                    userId: trip.currentUserId,
                });
            } else {
                response = await axios.post(`http://localhost:3000/likes/${trip.id}/unlike`, {
                    userId: trip.currentUserId,
                });
            }
            console.log('Like toggled:', response?.data);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const postSave = async () => {
        let response;
        try {
            if (!trip.isSaved) {
                response = await axios.post(`http://localhost:3000/saves/${trip.id}/save`, {
                    userId: trip.currentUserId,
                });
            } else {
                response = await axios.post(`http://localhost:3000/saves/${trip.id}/unsave`, {
                    userId: trip.currentUserId,
                });
            }
            console.log('save toggled:', response?.data);
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    const postFollow = async () => {
        try {
            const response = await axios.post(`http://localhost:3000/follow/${trip.user.id}/follow`, {
                userId: trip.currentUserId,
            });
            console.log('follow response:', response?.data);
        } catch (error) {
            console.log(error);
        }
    };

    // Add comment handler (optimistic update)
    const handleAddComment = async () => {
        if (!commentText.trim()) return;
        const response = await axios.post(`http://localhost:3000/trips/${trip.id}/comment`, {
            userId: trip.currentUserId,
            comment: commentText.trim()
        });

        // create optimistic comment
        const newComment: Comment = {
            id: response.data._id,
            user: {
                name: response.data.user.firstName + " " + response.data.user.lastName,
                username: '@' + response.data.user.firstName + response.data.user.lastName,
                avatar: 'https://i.pravatar.cc/150?img=33',
            },
            text: commentText.trim(),
            timestamp: response.data.createdAt,
        };

        // optimistic UI
        setComments((prev) => [newComment, ...prev]);
        setCommentText('');
    };

    // Emoji reactions
    const emojiOptions = ['👍', '❤️', '🤣', '😮', '🔥'];
    
    const handleEmojiReaction = async (commentId: string, emoji: string) => {
        // Optimistic UI update
        setCommentReactions((prev) => {
            const commentReacts = prev[commentId] || {};
            const currentCount = commentReacts[emoji] || 0;
            return {
                ...prev,
                [commentId]: {
                    ...commentReacts,
                    [emoji]: currentCount + 1,
                },
            };
        });

        try {
            // You can add an API call here to save the reaction
            await axios.post(`http://localhost:3000/trips/${trip.id}/comment/${commentId}/react`, {
                userId: trip.currentUserId,
                emoji,
            });
        } catch (error) {
            console.error('Error adding reaction:', error);
            // Rollback on error if needed
        }
    };

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
                        },
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
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowComments((prev) => !prev);
                                    }}
                                    aria-label="Comments"
                                >
                                    <ChatBubbleOutline color={showComments ? 'primary' : undefined} />
                                </IconButton>
                                <Typography variant="body2">{comments.length}</Typography>
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

                    {/* Comments Section (togglable) */}
                    {showComments && (
                        <Box
                            sx={{
                                borderTop: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.default',
                                px: 2,
                                pb: 2,
                            }}
                        >
                            <Box sx={{ maxHeight: 300, overflowY: 'auto', my: 1 }}>
                                {comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <Box
                                            key={comment.id}
                                            onMouseEnter={() => setHoveredCommentId(comment.id)}
                                            onMouseLeave={() => setHoveredCommentId(null)}
                                            sx={{ 
                                                position: 'relative',
                                                display: 'flex', 
                                                gap: 1.5, 
                                                py: 1, 
                                                alignItems: 'flex-start',
                                                '&:hover': {
                                                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                                                    borderRadius: 1,
                                                },
                                            }}
                                        >
                                            <Avatar src={comment.user.avatar} sx={{ width: 30, height: 30 }}>
                                                {comment.user.name}
                                            </Avatar>
                                            <Box sx={{ flex: 1, position: 'relative' }}>
                                                <Typography variant="subtitle2"> {comment.user.name}</Typography>
                                                <Typography variant="body2">{comment.text}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {comment.timestamp}
                                                </Typography>
                                                
                                                {/* Display reactions */}
                                                {commentReactions[comment.id] && Object.keys(commentReactions[comment.id]).length > 0 && (
                                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                                                        {Object.entries(commentReactions[comment.id]).map(([emoji, count]) => (
                                                            <Box
                                                                key={emoji}
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 0.3,
                                                                    px: 0.75,
                                                                    py: 0.25,
                                                                    borderRadius: 1,
                                                                    bgcolor: 'rgba(0, 0, 0, 0.05)',
                                                                    fontSize: '0.75rem',
                                                                }}
                                                            >
                                                                <span>{emoji}</span>
                                                                {count > 0 && <span>{count}</span>}
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                )}

                                                {/* Emoji reaction bar on hover */}
                                                {hoveredCommentId === comment.id && (
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            mt: 0.5,
                                                            display: 'flex',
                                                            gap: 0.5,
                                                            bgcolor: 'white',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                            borderRadius: 2,
                                                            p: 0.5,
                                                            zIndex: 10,
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onMouseEnter={(e) => e.stopPropagation()}
                                                    >
                                                        {emojiOptions.map((emoji) => (
                                                            <Box
                                                                key={emoji}
                                                                onClick={() => handleEmojiReaction(comment.id, emoji)}
                                                                sx={{
                                                                    cursor: 'pointer',
                                                                    fontSize: '1.25rem',
                                                                    px: 0.5,
                                                                    py: 0.25,
                                                                    borderRadius: 1,
                                                                    transition: 'transform 0.15s, background-color 0.15s',
                                                                    '&:hover': {
                                                                        transform: 'scale(1.3)',
                                                                        bgcolor: 'rgba(0, 0, 0, 0.05)',
                                                                    },
                                                                }}
                                                            >
                                                                {emoji}
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                                        No comments yet. Be the first to comment!
                                    </Typography>
                                )}
                            </Box>

                            {/* Add Comment */}
                            <Box display="flex" alignItems="center" gap={1}>
                                <Avatar src="https://i.pravatar.cc/150?img=33" sx={{ width: 30, height: 30 }}>
                                    Y
                                </Avatar>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAddComment();
                                        }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <IconButton
                                    color="primary"
                                    disabled={!commentText.trim()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddComment();
                                    }}
                                >
                                    <Send />
                                </IconButton>
                            </Box>
                        </Box>
                    )}
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
