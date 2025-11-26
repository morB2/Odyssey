import { CardActions, Box, IconButton, Typography } from '@mui/material';
import type { Dispatch, SetStateAction } from 'react';
import { Favorite, FavoriteBorder, ChatBubbleOutline, BookmarkBorder, Bookmark } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface TripPostActionsProps {
    isLiked: boolean;
    likesCount: number;
    isSaved: boolean;
    commentsCount: number;
    showComments: boolean;
    onLike: () => void;
    onSave: () => void;
    setShowComments: Dispatch<SetStateAction<boolean>>;
}

export default function TripPostActions({
    isLiked,
    likesCount,
    isSaved,
    commentsCount,
    showComments,
    onLike,
    onSave,
    setShowComments,
}: TripPostActionsProps) {
    const { t } = useTranslation();

    return (
        <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
            <Box display="flex" gap={2}>
                {/* Like Button */}
                <Box display="flex" alignItems="center">
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            onLike();
                        }}
                        aria-label={isLiked ? t('feed.unlike') : t('feed.like')}
                        color={isLiked ? 'primary' : 'default'}
                    >
                        {isLiked ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                    <Typography variant="body2">{likesCount}</Typography>
                </Box>

                {/* Comments Button */}
                <Box display="flex" alignItems="center">
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowComments((prev) => !prev);
                        }}
                        aria-label={t('feed.comments')}
                    >
                        <ChatBubbleOutline color={showComments ? 'primary' : undefined} />
                    </IconButton>
                    <Typography variant="body2">{commentsCount}</Typography>
                </Box>
            </Box>

            {/* Save Button */}
            <IconButton
                onClick={(e) => {
                    e.stopPropagation();
                    onSave();
                }}
                aria-label={isSaved ? t('feed.unsave') : t('feed.save')}
                color={isSaved ? 'primary' : 'default'}
            >
                {isSaved ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
        </CardActions>
    );
}