import { Box, Typography, Avatar, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { Send, Delete } from '@mui/icons-material';
import { useState } from 'react';
import { type Comment } from './types';
import { Link } from 'react-router-dom';

const emojiOptions = ['👍', '❤️', '🤣', '😮', '🔥'];

interface CommentItemProps {
    comment: Comment;
    reactions: Record<string, number> | undefined;
    onReact: (commentId: string, emoji: string) => void;
    onReply: (commentId: string, replyText: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
    userAvatar: string | undefined;
    currentUserId: string | undefined;
    postOwnerId: string;
}

const CommentItem = ({ comment, reactions, onReact, onReply, onDelete, userAvatar, currentUserId, postOwnerId }: CommentItemProps) => {
    const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Resolve comment author's id (backend may provide either `userId` or `user._id`)
    const commentAuthorId = comment.userId;
    
    // Check if current user can delete this comment: either the comment author or the post owner
    const canDelete = Boolean(currentUserId) && (commentAuthorId === currentUserId || postOwnerId === currentUserId);
    
    const handleReplySubmit = async () => {
        if (!replyText.trim()) return;
        await onReply(comment.id, replyText.trim());
        setReplyText('');
        setIsReplying(false);
    };

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setDeleteDialogOpen(false);
        await onDelete(comment.id);
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
    };

    return (
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
            <Avatar src={comment.user.avatar} sx={{ width: 30, height: 30, cursor: "pointer" }}>
                {comment.user.name[0]}
            </Avatar>
            <Box sx={{ flex: 1, position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2"> {comment.user.name}</Typography>
                    {canDelete && hoveredCommentId === comment.id && (
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick();
                            }}
                            sx={{
                                opacity: 0.7,
                                '&:hover': { opacity: 1, color: 'error.main' }
                            }}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    )}
                </Box>
                <Typography variant="body2">{comment.text}</Typography>
                <Typography variant="caption" color="text.secondary">
                    {comment.timestamp}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{ ml: 2, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsReplying(!isReplying);
                    }}
                >
                    Reply
                </Typography>

                {/* Display reactions */}
                {reactions && Object.keys(reactions).length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                        {Object.entries(reactions).map(([emoji, count]) => (
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
                            bottom: -35,
                            left: 0,
                            display: 'flex',
                            gap: 0.5,
                            bgcolor: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            borderRadius: 2,
                            p: 0.5,
                            zIndex: 10,
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={() => setHoveredCommentId(comment.id)}
                    >
                        {emojiOptions.map((emoji) => (
                            <Box
                                key={emoji}
                                onClick={() => onReact(comment.id, emoji)}
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

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <Box sx={{ mt: 1, pl: 2, borderLeft: '2px solid rgba(0,0,0,0.1)' }}>
                        {comment.replies.map((reply) => (
                            <Box key={reply.id} sx={{ mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar src={reply.user.avatar} sx={{ width: 20, height: 20 }}>
                                        {reply.user.name[0]}
                                    </Avatar>
                                    <Typography variant="subtitle2" sx={{ fontSize: '0.8rem' }}>
                                        {reply.user.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {reply.timestamp}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontSize: '0.85rem', ml: 3.5 }}>
                                    {reply.text}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Reply Input */}
                {isReplying && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Avatar src={userAvatar} sx={{ width: 24, height: 24 }}>
                            {'U'}
                        </Avatar>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleReplySubmit();
                                }
                            }}
                            sx={{ '& .MuiInputBase-input': { fontSize: '0.85rem', py: 0.5 } }}
                        />
                        <IconButton
                            size="small"
                            color="primary"
                            disabled={!replyText.trim()}
                            onClick={handleReplySubmit}
                        >
                            <Send fontSize="small" />
                        </IconButton>
                    </Box>
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                onClick={(e) => e.stopPropagation()}
            >
                <DialogTitle>Delete Comment</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this comment? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};


interface TripCommentsSectionProps {
    comments: Comment[];
    commentReactions: Record<string, Record<string, number>>;
    userAvatar: string | undefined;
    currentUserId: string | undefined;
    postOwnerId: string;
    onAddComment: (text: string) => Promise<void>;
    onReact: (commentId: string, emoji: string) => Promise<void>;
    onReply: (commentId: string, replyText: string) => Promise<void>;
    onDeleteComment: (commentId: string) => Promise<void>;
}

export default function TripCommentsSection({
    comments,
    commentReactions,
    userAvatar,
    currentUserId,
    postOwnerId,
    onAddComment,
    onReact,
    onReply,
    onDeleteComment,
}: TripCommentsSectionProps) {
    const [commentText, setCommentText] = useState('');

    const handleSubmit = () => {
        if (!commentText.trim()) return;
        onAddComment(commentText.trim());
        setCommentText('');
    };

    return (
        <Box
            sx={{
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
                px: 2,
                pb: 2,
            }}
        >
            {/* Comments List */}
            <Box sx={{ maxHeight: 300, overflowY: 'auto', my: 1 }}>
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            reactions={commentReactions[comment.id]}
                            onReact={onReact}
                            onReply={onReply}
                            onDelete={onDeleteComment}
                            userAvatar={userAvatar}
                            currentUserId={currentUserId}
                            postOwnerId={postOwnerId}
                        />
                    ))
                ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                        No comments yet. Be the first to comment!
                    </Typography>
                )}
            </Box>

            {/* Add Comment Input */}
            <Box display="flex" alignItems="center" gap={1}>
                <Avatar src={userAvatar} sx={{ width: 30, height: 30 }}>
                    {'U'}
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
                            handleSubmit();
                        }
                    }}
                    onClick={(e) => e.stopPropagation()}
                />
                <IconButton
                    color="primary"
                    disabled={!commentText.trim()}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSubmit();
                    }}
                >
                    <Send />
                </IconButton>
            </Box>
        </Box>
    );
}