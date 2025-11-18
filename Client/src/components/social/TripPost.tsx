import {
    Card,
    CardContent,
    CardActions,
    Box,
    createTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    ThemeProvider,
} from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { type Comment, type Trip } from './types';
import { useUserStore } from '../../store/userStore';
import TripPostHeader from './TripPostHeader';
import TripImageCarousel from './TripImageCarousel';
import TripPostActions from './TripPostActions';
import TripPostContent from './TripPostContent';
import TripCommentsSection from './TripCommentsSection';
import TripDetailsDialog from './TripDetailsDialog';

const theme = createTheme({
    palette: {
        primary: {
            main: '#eb7c31ff',
        },
    },
});

interface TripPostProps {
    trip: Trip;
}

// Helper to initialize comment reactions
const initializeReactions = (comments: Comment[]): Record<string, Record<string, number>> => {
    const reactions: Record<string, Record<string, number>> = {};
    comments.forEach((comment) => {
        if (comment.id && comment.reactionsAggregated) {
            reactions[comment.id] = comment.reactionsAggregated;
        }
    });
    return reactions;
};


export default function TripPost({ trip }: TripPostProps) {
    // --- Post State ---
    const [isLiked, setIsLiked] = useState(trip.isLiked);
    const [likesCount, setLikesCount] = useState(trip.likes);
    const [isSaved, setIsSaved] = useState(trip.isSaved);
    const [isFollowing, setIsFollowing] = useState(trip.user.isFollowing);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>(trip.comments || []);
    const [commentReactions, setCommentReactions] = useState<Record<string, Record<string, number>>>(
        initializeReactions(trip.comments || [])
    );
    const { user } = useUserStore(); // Current logged-in user

    // --- Image/Dialog State ---
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogImageIndex, setDialogImageIndex] = useState(0);

    // Update local state when trip prop changes
    useEffect(() => {
        setIsLiked(trip.isLiked);
        setLikesCount(trip.likes);
        setIsSaved(trip.isSaved);
        setIsFollowing(trip.user.isFollowing);
        setComments(trip.comments || []);
        setCommentReactions(initializeReactions(trip.comments || []));
    }, [trip.isLiked, trip.likes, trip.isSaved, trip.user.isFollowing, trip.comments]);


    // --- API Handlers ---
    const postLike = useCallback(async () => {
        const originalIsLiked = isLiked;
        const originalLikesCount = likesCount;

        // Optimistic UI update
        const newIsLiked = !originalIsLiked;
        const newLikesCount = originalIsLiked ? originalLikesCount - 1 : originalLikesCount + 1;
        
        setIsLiked(newIsLiked);
        setLikesCount(newLikesCount);

        try {
            if (!originalIsLiked) { 
                await axios.post(`http://localhost:3000/likes/${trip._id}/like`, { userId: trip.currentUserId });
            } else {
                await axios.post(`http://localhost:3000/likes/${trip._id}/unlike`, { userId: trip.currentUserId });
            }
        } catch (error) {
            console.error('Error toggling like, rolling back:', error);
            // Rollback on API error
            setIsLiked(originalIsLiked);
            setLikesCount(originalLikesCount); 
        }
    }, [isLiked, likesCount, trip._id, trip.currentUserId]);

    const postSave = useCallback(async () => {
        const newIsSaved = !isSaved;
        setIsSaved(newIsSaved); // Optimistic UI update

        try {
            if (!isSaved) { 
                await axios.post(`http://localhost:3000/saves/${trip._id}/save`, { userId: trip.currentUserId });
            } else {
                await axios.post(`http://localhost:3000/saves/${trip._id}/unsave`, { userId: trip.currentUserId });
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            setIsSaved(!newIsSaved); // Rollback optimistic update
        }
    }, [isSaved, trip._id, trip.currentUserId]);

    const postFollow = useCallback(async () => {
        const newIsFollowing = !isFollowing;
        setIsFollowing(newIsFollowing); // Optimistic UI update

        try {
            await axios.post(
                `http://localhost:3000/follow/${trip.user._id}/${isFollowing ? 'unfollow' : 'follow'}`, 
                { userId: trip.currentUserId }
            );
        } catch (error) {
            console.error('Error toggling follow:', error);
            setIsFollowing(!newIsFollowing); // Rollback optimistic update
        }
    }, [isFollowing, trip.user._id, trip.currentUserId]);

    const handleAddComment = useCallback(async (commentText: string) => {
        try {
            const response = await axios.post(`http://localhost:3000/trips/${trip._id}/comment`, {
                userId: trip.currentUserId,
                comment: commentText.trim()
            });

            // Create and apply optimistic comment
            const newComment: Comment = {
                id: response.data._id,
                user: {
                    name: response.data.user.firstName + " " + response.data.user.lastName,
                    username: '@' + response.data.user.firstName + response.data.user.lastName,
                    avatar: user?.avatar || '/default-avatar.png',
                },
                text: commentText.trim(),
                timestamp: response.data.createdAt,
            };

            setComments((prev) => [newComment, ...prev]);
        } catch (error) {
            console.error('Error adding comment:', error);
            // In a real app, you might remove the optimistic comment on failure
        }
    }, [trip._id, trip.currentUserId, user?.avatar]);

    const handleEmojiReaction = useCallback(async (commentId: string, emoji: string) => {
        // Optimistic UI update for reaction count
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
            await axios.post(`http://localhost:3000/trips/${trip._id}/comment/${commentId}/react`, {
                userId: trip.currentUserId,
                emoji,
            });
        } catch (error) {
            console.error('Error adding reaction:', error);
            // In a real app, you might decrement the count on failure
        }
    }, [trip._id, trip.currentUserId]);


    // --- Dialog Handlers ---
    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent opening dialog when clicking on interactive elements
        if (
            e.target instanceof HTMLElement && (
                e.target.closest('button') ||
                e.target.closest('a') ||
                e.target.closest('input') ||
                e.target.closest('textarea') ||
                e.target.getAttribute?.('role') === 'button'
            )
        ) {
            return;
        }
        setDialogOpen(true);
        setDialogImageIndex(currentImageIndex); // Open dialog to the current image
    };

    const handleCloseDialog = () => setDialogOpen(false);


    return (
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
                <TripPostHeader 
                    user={trip.user} 
                    currentUserId={trip.currentUserId||" "}
                    isFollowing={isFollowing} 
                    onFollow={postFollow} 
                />

                {/* Image Carousel */}
                <TripImageCarousel
                    images={trip.images}
                    currentImageIndex={currentImageIndex}
                    setCurrentImageIndex={setCurrentImageIndex}
                    title={trip.title}
                />

                {/* Actions */}
                <TripPostActions
                    isLiked={isLiked}
                    likesCount={likesCount}
                    isSaved={isSaved}
                    commentsCount={comments.length}
                    onLike={postLike}
                    onSave={postSave}
                    showComments={showComments}
                    setShowComments={setShowComments}
                />

                {/* Content */}
                <CardContent>
                    <TripPostContent 
                        title={trip.title}
                        duration={trip.duration||''}
                        description={trip.description}
                        activities={trip.activities}
                    />
                </CardContent>

                {/* Comments Section (togglable) */}
                {showComments && (
                    <TripCommentsSection
                        comments={comments}
                        commentReactions={commentReactions}
                        userAvatar={user?.avatar}
                        onAddComment={handleAddComment}
                        onReact={handleEmojiReaction}
                    />
                )}
            </Card>

            {/* Detailed Trip Dialog */}
            <TripDetailsDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                trip={trip}
                dialogImageIndex={dialogImageIndex}
                setDialogImageIndex={setDialogImageIndex}
            />
        </ThemeProvider>
    );
}