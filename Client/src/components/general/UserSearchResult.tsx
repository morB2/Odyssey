import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Avatar, Typography, Paper } from '@mui/material';
import type { SearchUser } from '../../api/searchApi';

interface UserSearchResultProps {
    user: SearchUser;
    onClick?: () => void;
}

const UserSearchResult: React.FC<UserSearchResultProps> = ({ user, onClick }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
        navigate(`/profile/${user._id}`);
    };

    return (
        <Paper
            elevation={0}
            onClick={handleClick}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                padding: 2.5,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: 'transparent',
                borderRadius: 2,
                border: '1px solid transparent',
                '&:hover': {
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    transform: 'translateX(4px)',
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                },
            }}
        >
            <Avatar
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                sx={{
                    width: 56,
                    height: 56,
                    border: '2px solid #FF9800',
                }}
            />
            <Box sx={{ flex: 1 }}>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 600,
                        color: '#333',
                        fontSize: '1.1rem',
                        mb: 0.5,
                    }}
                >
                    {user.firstName} {user.lastName}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: '#666',
                        fontSize: '0.95rem',
                    }}
                >
                    @{user.firstName.toLowerCase()}{user.lastName.toLowerCase()}
                </Typography>
            </Box>
            {user.isFollowing && (
                <Typography
                    variant="caption"
                    sx={{
                        color: '#FF9800',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        padding: '4px 12px',
                        borderRadius: '12px',
                    }}
                >
                    Following
                </Typography>
            )}
        </Paper>
    );
};

export default UserSearchResult;
