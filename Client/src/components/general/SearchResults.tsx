import React from 'react';
import { Box, Typography, Divider, CircularProgress, Paper } from '@mui/material';
import UserSearchResult from './UserSearchResult';
import TripPostAdapter from '../user/TripPostAdapter';
import type { SearchResults } from '../../services/searchApi';
import type { Trip } from '../user/types';

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
                    left: 0,
                    right: 0,
                    mt: 1,
                    maxHeight: '85vh',
                    overflow: 'auto',
                    zIndex: 1300,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    padding: 3,
                    minWidth: '600px',
                    width: '600px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
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
                    left: 0,
                    right: 0,
                    mt: 1,
                    maxHeight: '85vh',
                    overflow: 'auto',
                    zIndex: 1300,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    padding: 3,
                    minWidth: '600px',
                    width: '600px',
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
                left: 0,
                right: 0,
                mt: 1,
                maxHeight: '85vh',
                overflow: 'auto',
                zIndex: 1300,
                backgroundColor: 'white',
                borderRadius: 2,
                padding: 3,
                minWidth: '600px',
                width: '600px',
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
                            px: 1,
                            fontSize: '1.2rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                    >
                        Users
                    </Typography>
                    <Box>
                        {results.users.map((user) => (
                            <UserSearchResult key={user._id} user={user} onClick={onClose} />
                        ))}
                    </Box>
                </Box>
            )}

            {/* Divider between sections */}
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
                            px: 1,
                            fontSize: '1.2rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                    >
                        Posts
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {results.trips.map((trip) => (
                            <Box
                                key={trip._id}
                                onClick={onClose}
                                sx={{
                                    transform: 'scale(1.1)',
                                    transformOrigin: 'top left',
                                    mb: 2,
                                }}
                            >
                                <TripPostAdapter
                                    trip={convertToTrip(trip)}
                                    setTrips={() => { }}
                                    onDelete={() => { }}
                                    onEdit={() => { }}
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
