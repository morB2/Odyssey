import { Avatar, Button, CardContent, Box, Typography, IconButton, Menu, MenuItem, ListItemText, ListItemIcon } from '@mui/material';
import { toast } from 'react-toastify';

import { Link } from 'react-router-dom';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useState } from 'react';
import { type Trip } from './types';
import { ReportDialog } from './ReportDialog';
import { useTranslation } from 'react-i18next';
import { useChat } from '../../context/ChatContext';
import { MessageCircleMore, Flag,Link2 } from 'lucide-react';
interface TripPostHeaderProps {
    user: Trip['user'];
    currentUserId: string;
    isFollowing: boolean;
    onFollow: () => void;
    tripId: string;
}

export default function TripPostHeader({ user, currentUserId, isFollowing, onFollow, tripId }: TripPostHeaderProps) {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [reportOpen, setReportOpen] = useState(false);
    const open = Boolean(anchorEl);
    const { openChat } = useChat();

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (event?: React.MouseEvent) => {
        event?.stopPropagation();
        setAnchorEl(null);
    };

    const handleCopyLink = (event: React.MouseEvent) => {
        event.stopPropagation();
        handleMenuClose();
        const link = `${window.location.origin}/post/${tripId}`;
        navigator.clipboard.writeText(link).then(() => {
            toast.success(t('social.linkCopied'));
        });
    };

    const handleReportClick = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent card click
        handleMenuClose();
        setReportOpen(true);
    };

    const handleChatClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        handleMenuClose();
        openChat(user);
    };

    return (
        <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Link to={`/profile/${user._id}`} style={{ textDecoration: 'none', color: 'inherit' }} onClick={(e) => e.stopPropagation()}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar src={user.avatar} alt={`${user.firstName} ${user.lastName}`}>
                            {user.firstName[0]}
                        </Avatar>
                        <Box>
                            <Typography variant="body1" fontWeight={500}>
                                {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                @{user.firstName.toLowerCase()}{user.lastName.toLowerCase()}
                            </Typography>
                        </Box>
                    </Box>
                </Link>

                <Box display="flex" alignItems="center" gap={1}>
                    {user._id !== currentUserId && (
                        <Button
                            variant={isFollowing ? 'outlined' : 'contained'}
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onFollow();
                            }}
                        >
                            {isFollowing ? t('social.following') : t('social.follow')}
                        </Button>
                    )}

                    <IconButton
                        aria-label="settings"
                        onClick={handleMenuClick}
                        size="small"
                    >
                        <MoreVertIcon />
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={() => setAnchorEl(null)} // Basic close without stopPropagation for backdrop click
                        onClick={(e) => e.stopPropagation()} // Stop clicks inside menu from bubbling
                    >
                        {user._id !== currentUserId && (

                            <MenuItem onClick={handleChatClick}>
                                <ListItemIcon>
                                    <MessageCircleMore size={18} />
                                </ListItemIcon>
                                <ListItemText>{t("social.chat")}</ListItemText>
                            </MenuItem>
                        )}
                        <MenuItem onClick={handleReportClick}>
                            <ListItemIcon>
                                <Flag size={18} />
                            </ListItemIcon>
                            <ListItemText>{t("report.title")}</ListItemText>
                        </MenuItem>

                        <MenuItem onClick={handleCopyLink}>
                            <ListItemIcon>
                                <Link2 size={18} />
                            </ListItemIcon>
                            <ListItemText>{t("social.copyLink")}</ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>

            <ReportDialog
                open={reportOpen}
                onClose={() => setReportOpen(false)}
                tripId={tripId}
                userId={currentUserId}
            />
        </CardContent>
    );
}