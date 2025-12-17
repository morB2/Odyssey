import {
    Card,
    CardContent,
    createTheme,
    ThemeProvider,
    Box,
    IconButton,
} from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { type Comment, type Trip } from './types';
import { useUserStore } from '../../store/userStore';
import TripPostHeader from './TripPostHeader';
import TripImageCarousel from './TripImageCarousel';
import TripPostActions from './TripPostActions';
import TripPostContent from './TripPostContent';
import TripCommentsSection from './TripCommentsSection';
import TripDetailsDialog from './TripDetailsDialog';
import { toggleLike, toggleSave, toggleFollow, addComment, addReaction, addReply, incrementView, deleteComment } from '../../services/tripPost.service';
import { useTripRealtime } from '../../hooks/useTripRealtime';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Trash2, Edit, Lock, Globe } from 'lucide-react';
import { ConfirmDialog } from '../general/ConfirmDialog';

const theme = createTheme({
    palette: {
        primary: {
            main: '#eb7c31ff',
        },
    },
});

interface TripPostProps {
    trip: Trip;
    maxLines?: number;
    showDescription?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
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


export default function TripPost({ trip, maxLines, showDescription, onEdit, onDelete }: TripPostProps) {
    const { t } = useTranslation();
    // --- Post State ---
    const [isLiked, setIsLiked] = useState(trip.isLiked);
    const [likesCount, setLikesCount] = useState(trip.likes);
    const [viewsCount, setViewsCount] = useState(trip.views || 0);
    const [isSaved, setIsSaved] = useState(trip.isSaved);
    const [isFollowing, setIsFollowing] = useState(trip.user.isFollowing);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>(trip.comments || []);
    const [commentReactions, setCommentReactions] = useState<Record<string, Record<string, number>>>(
        initializeReactions(trip.comments || [])
    );
    const { user } = useUserStore(); // Current logged-in user
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // --- Image/Dialog State ---
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogImageIndex, setDialogImageIndex] = useState(0);
    const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);

    // Auto-play carousel
    useEffect(() => {
        if (!trip.images || trip.images.length <= 1 || isHoveringCarousel) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === (trip.images?.length || 1) - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [trip.images, isHoveringCarousel]);

    // Update local state when trip prop changes
    useEffect(() => {
        setIsLiked(trip.isLiked);
        setLikesCount(trip.likes);
        setViewsCount(trip.views || 0);
        setIsSaved(trip.isSaved);
        setIsFollowing(trip.user.isFollowing);
        setComments(trip.comments || []);
        setCommentReactions(initializeReactions(trip.comments || []));
    }, [trip.isLiked, trip.likes, trip.views, trip.isSaved, trip.user.isFollowing, trip.comments]);

    useTripRealtime({
        tripId: trip._id,
        onNewComment: (newComment) => setComments((prev) => [newComment, ...prev]),
        onNewReaction: (commentId, reactions) =>
            setCommentReactions((prev) => ({ ...prev, [commentId]: reactions })),
        onNewReply: (commentId, reply) =>
            setComments((prev) =>
                prev.map((c) =>
                    c.id === commentId
                        ? { ...c, replies: [...(c.replies || []), reply] }
                        : c
                )
            ),
        onLikeUpdate: (likes) => setLikesCount(likes),
        onViewUpdate: (views) => setViewsCount(views),
        onCommentDeleted: (commentId) => setComments((prev) => prev.filter((c) => c.id !== commentId)),
    });
    // --- API Handlers ---
    const postLike = useCallback(async () => {
        if (!trip.currentUserId || trip.currentUserId.trim() === '') {
            toast.info(t('social.pleaseLoginToLike'));
            return;
        }

        const originalIsLiked = isLiked;
        const originalLikesCount = likesCount;

        // Optimistic UI update
        const newIsLiked = !originalIsLiked;
        const newLikesCount = originalIsLiked ? originalLikesCount - 1 : originalLikesCount + 1;

        setIsLiked(newIsLiked);
        setLikesCount(newLikesCount);

        try {
            await toggleLike(trip._id, originalIsLiked); // ✅ Removed userId
        } catch (error) {
            console.error('Error toggling like, rolling back:', error);
            toast.error(t('social.failedToLike'));
            // Rollback on API error
            setIsLiked(originalIsLiked);
            setLikesCount(originalLikesCount);
        }
    }, [isLiked, likesCount, trip._id, trip.currentUserId, t]);

    const postSave = useCallback(async () => {
        if (!trip.currentUserId || trip.currentUserId.trim() === '') {
            toast.info(t('social.pleaseLoginToSave'));
            return;
        }

        const newIsSaved = !isSaved;
        setIsSaved(newIsSaved); // Optimistic UI update

        try {
            await toggleSave(trip._id, isSaved); // ✅ Removed userId
            if (newIsSaved) {
                toast.success(t('social.tripSaved'));
            } else {
                toast.info(t('social.tripUnsaved'));
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            toast.error(t('social.failedToSave'));
            setIsSaved(!newIsSaved); // Rollback optimistic update
        }
    }, [isSaved, trip._id, trip.currentUserId, t]);

    const postFollow = useCallback(async () => {
        if (!trip.currentUserId || trip.currentUserId.trim() === '') {
            toast.info(t('social.pleaseLoginToFollow'));
            return;
        }

        const newIsFollowing = !isFollowing;
        setIsFollowing(newIsFollowing); // Optimistic UI update

        try {
            await toggleFollow(trip.user._id, isFollowing); // ✅ Removed currentUserId
            if (newIsFollowing) {
                toast.success(`${t('social.followingUser')} ${trip.user.firstName}`);
            } else {
                toast.info(`${t('social.unfollowedUser')} ${trip.user.firstName}`);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            toast.error(t('social.failedToFollow'));
            setIsFollowing(!newIsFollowing); // Rollback optimistic update
        }
    }, [isFollowing, trip.user._id, trip.currentUserId, trip.user.firstName, t]);


    const handleEmojiReaction = useCallback(async (commentId: string, emoji: string) => {
        if (!trip.currentUserId || trip.currentUserId.trim() === '') {
            toast.info(t('social.pleaseLoginToReact'));
            return;
        }

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
            await addReaction(trip._id, commentId, emoji); // ✅ Removed userId
        } catch (error) {
            console.error('Error adding reaction:', error);
            toast.error(t('social.failedToReact'));
            // In a real app, you might decrement the count on failure
        }
    }, [trip._id, trip.currentUserId, t]);
    const handleAddComment = useCallback(async (commentText: string) => {
        if (!trip.currentUserId || trip.currentUserId.trim() === '') {
            toast.info(t('social.pleaseLoginToComment'));
            return;
        }

        try {
            await addComment(trip._id, commentText.trim()); // ✅ Removed userId
            // Removed the optimistic update - useTripRealtime will handle it
            toast.success(t('social.commentAdded'));
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error(t('social.failedToComment'));
        }
    }, [trip._id, trip.currentUserId, t]); // Also removed user?.avatar from dependencies

    const handleAddReply = useCallback(async (commentId: string, replyText: string) => {
        if (!trip.currentUserId || trip.currentUserId.trim() === '') {
            toast.info(t('social.pleaseLoginToReply'));
            return;
        }

        try {
            await addReply(trip._id, commentId, replyText.trim()); // ✅ Removed userId
            // Removed the optimistic update - useTripRealtime will handle it
            toast.success(t('social.replyAdded'));
        } catch (error) {
            console.error('Error adding reply:', error);
            toast.error(t('social.failedToReply'));
        }
    }, [trip._id, trip.currentUserId, t]);

    const handleDeleteComment = useCallback(async (commentId: string) => {
        if (!trip.currentUserId || trip.currentUserId.trim() === '') {
            toast.info(t('social.pleaseLoginToDelete'));
            return;
        }
        // Optimistic UI update
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        try {
            await deleteComment(trip._id, commentId); // ✅ Removed userId
            toast.success(t('social.commentDeleted'));
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error(t('social.failedToDeleteComment'));
            // Rollback optimistic update - refetch comments or restore from backup
            // For now, real-time will handle consistency
        }
    }, [trip._id, trip.currentUserId, t]);
    // --- Dialog Handlers ---
    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent opening dialog when clicking on interactive elements
        e.stopPropagation();
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

        // Increment view count
        incrementView(trip._id, trip.currentUserId).catch(err => console.error("Failed to increment view", err));
    };

    const handleCloseDialog = () => setDialogOpen(false);

    // --- Edit/Delete Handlers ---
    const handleDeleteClick = () => setShowDeleteConfirm(true);
    const handleDeleteConfirm = () => {
        onDelete?.();
        setShowDeleteConfirm(false);
    };

    // Check if current user owns this trip
    const isOwner = trip.user._id && user?._id === trip.user._id;
    const showEditDeleteButtons = isOwner && (onEdit || onDelete);


    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ position: 'relative' }}>
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
                    {/* Edit/Delete Buttons */}
                    {showEditDeleteButtons && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 23,
                                left: '70%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: 1,
                                zIndex: 10,
                            }}
                        >
                            {/* Visibility Status Icon disabled*/}

                            <Box
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: '50%',
                                    width: 28,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#6b7280',
                                }}
                            >
                                {(trip as any)?.visabilityStatus === 'public' ? (
                                    <Globe size={18} />
                                ) : (
                                    <Lock size={18} />
                                )}
                            </Box>


                            {onEdit && (
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit();
                                    }}
                                    size="small"
                                    sx={{
                                        color: '#6b7280',
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 1)',
                                            color: '#374151',
                                        },
                                    }}
                                >
                                    <Edit size={18} />
                                </IconButton>
                            )}
                            {onDelete && (
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick();
                                    }}
                                    size="small"
                                    sx={{
                                        color: '#6b7280',
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 1)',
                                            color: '#dc2626',
                                        },
                                    }}
                                >
                                    <Trash2 size={18} />
                                </IconButton>
                            )}

                        </Box>
                    )}
                    {/* Header */}
                    <TripPostHeader
                        user={trip.user}
                        currentUserId={trip.currentUserId || " "}
                        isFollowing={isFollowing}
                        onFollow={postFollow}
                        tripId={trip._id}
                    />

                    {/* Image Carousel */}
                    <TripImageCarousel
                        images={trip.images}
                        currentImageIndex={currentImageIndex}
                        setCurrentImageIndex={setCurrentImageIndex}
                        title={trip.title}
                        onMouseEnter={() => setIsHoveringCarousel(true)}
                        onMouseLeave={() => setIsHoveringCarousel(false)}
                    />

                    {/* Actions */}
                    <TripPostActions
                        isLiked={isLiked}
                        likesCount={likesCount}
                        isSaved={isSaved}
                        commentsCount={comments.length}
                        viewsCount={viewsCount}
                        onLike={postLike}
                        onSave={postSave}
                        showComments={showComments}
                        setShowComments={setShowComments}
                    />

                    {/* Content */}
                    <CardContent>
                        <TripPostContent
                            title={trip.title}
                            duration={trip.duration || ''}
                            description={trip.description}
                            activities={trip.activities}
                            maxLines={maxLines}
                            showDescription={showDescription}
                        />
                    </CardContent>

                    {/* Comments Section (togglable) */}
                    {showComments && (
                        <TripCommentsSection
                            comments={comments}
                            commentReactions={commentReactions}
                            userAvatar={user?.avatar}
                            currentUserId={trip.currentUserId}
                            postOwnerId={trip.user._id}
                            onAddComment={handleAddComment}
                            onReact={handleEmojiReaction}
                            onReply={handleAddReply}
                            onDeleteComment={handleDeleteComment}
                        />
                    )}
                </Card>

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDeleteConfirm}
                    title={t('tripPost.deleteTrip')}
                    message={t('tripPost.deleteConfirmMessage')}
                />
            </Box>

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