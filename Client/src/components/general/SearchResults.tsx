import React from 'react';
import { Box, Typography, Divider, CircularProgress, Paper } from '@mui/material';
import UserSearchResult from './UserSearchResult';
import TripPost from '../social/TripPost';
import type { SearchResults } from '../../services/search.service';
import type { Trip } from '../user/types';
import { adaptCommentsForUI } from '../../utils/tripAdapters';

interface SearchResultsProps {
    results: SearchResults | null;
    loading: boolean;
    query: string;
    onClose: () => void;
}

const SearchResultsComponent: React.FC<SearchResultsProps> = ({
    results,
    loading,
    query,
    onClose,
}) => {
    if (loading) {
        return (
            <Paper
                elevation={8}
                sx={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    mt: 1,
                    maxHeight: '85vh',
                    overflow: 'auto',
                    zIndex: 1300,
                    backgroundColor: 'white',
                    borderRadius: 3,
                    p: 3,
                    width: { xs: '95%', sm: '600px' },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                }}
            >
                <CircularProgress sx={{ color: '#FF9800' }} />
            </Paper>
        );
    }

    if (!results || (!results.users.length && !results.trips.length)) {
        if (!query) return null;

        return (
            <Paper
                elevation={8}
                sx={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    mt: 1,
                    maxHeight: '85vh',
                    overflow: 'auto',
                    zIndex: 1300,
                    backgroundColor: 'white',
                    borderRadius: 3,
                    p: 3,
                    width: { xs: '95%', sm: '600px' },
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                }}
            >
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    No results found for "{query}"
                </Typography>
            </Paper>
        );
    }

    // Convert SearchTrip to Trip type for TripPostAdapter
    const convertToTrip = (searchTrip: any): Trip => ({
        _id: searchTrip._id,
        id: searchTrip._id,
        user: {
            _id: searchTrip.user._id,
            id: searchTrip.user._id,
            firstName: searchTrip.user.firstName,
            lastName: searchTrip.user.lastName,
            username: `@${searchTrip.user.firstName.toLowerCase()}${searchTrip.user.lastName.toLowerCase()}`,
            avatar: searchTrip.user.avatar,
            isFollowing: searchTrip.user.isFollowing,
        },
        location: searchTrip.title || '',
        duration: '',
        description: searchTrip.description || '',
        activities: searchTrip.activities || [],
        images: searchTrip.images || [],
        likes: searchTrip.likes || 0,
        views: searchTrip.views || 0,
        isLiked: searchTrip.isLiked || false,
        isSaved: searchTrip.isSaved || false,
        optimizedRoute: searchTrip.optimizedRoute,
        comments: searchTrip.comments || [],
    });

    return (
        <Paper
            elevation={8}
            sx={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                mt: 1,
                maxHeight: '85vh',
                overflowY: 'auto',
                zIndex: 1300,
                backgroundColor: 'white',
                borderRadius: 3,
                p: 3,
                width: { xs: '95%', sm: '600px' },
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
            }}
        >
            {/* Users Section */}
            {results.users.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            color: '#FF9800',
                            mb: 2,
                            fontSize: '1.25rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                    >
                        Users
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {results.users.map((user) => (
                            <UserSearchResult key={user._id} user={user} onClick={onClose} />
                        ))}
                    </Box>
                </Box>
            )}

            {/* Divider */}
            {results.users.length > 0 && results.trips.length > 0 && (
                <Divider sx={{ my: 3, borderColor: '#FF9800', borderWidth: 1 }} />
            )}

            {/* Posts Section */}
            {results.trips.length > 0 && (
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            color: '#FF9800',
                            mb: 2,
                            fontSize: '1.25rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                    >
                        Posts
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {results.trips.map((trip) => (
                            <Box
                                key={trip._id}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                                    backgroundColor: '#fff',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                    },
                                }}
                            >
                                <TripPost
                                    trip={{ ...convertToTrip(trip), comments: adaptCommentsForUI(convertToTrip(trip).comments || []) }}
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
        </Paper>
    );
};

export default SearchResultsComponent;
