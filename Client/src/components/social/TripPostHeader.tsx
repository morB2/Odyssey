import { Avatar, Button, CardContent, Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useState } from 'react';
import { type Trip } from './types';
import { ReportDialog } from './ReportDialog';

interface TripPostHeaderProps {
    user: Trip['user'];
    currentUserId: string;
    isFollowing: boolean;
    onFollow: () => void;
    tripId: string;
}

export default function TripPostHeader({ user, currentUserId, isFollowing, onFollow, tripId }: TripPostHeaderProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [reportOpen, setReportOpen] = useState(false);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (event?: React.MouseEvent) => {
        event?.stopPropagation();
        setAnchorEl(null);
    };

    const handleReportClick = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent card click
        handleMenuClose();
        setReportOpen(true);
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
                            {isFollowing ? 'Following' : 'Follow'}
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
                        <MenuItem onClick={handleReportClick}>Report</MenuItem>
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