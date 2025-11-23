import { Avatar, Button, CardContent, Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { type Trip } from './types'; // Assuming 'types' is in the same directory

interface TripPostHeaderProps {
    user: Trip['user'];
    currentUserId: string;
    isFollowing: boolean;
    onFollow: () => void;
}

export default function TripPostHeader({ user, currentUserId, isFollowing, onFollow }: TripPostHeaderProps) {
    return (
        <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Link to={`/profile/${user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
            </Box>
        </CardContent>
    );
}