import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import { MapPin, Calendar, Heart, Eye } from 'lucide-react';

interface Trip {
    _id: string;
    title: string;
    description?: string;
    images?: string[];
    createdAt: string;
    activities?: string[];
    likes?: number;
    views?: number;
    optimizedRoute?: {
        ordered_route?: Array<{ name: string }>;
    };
}

interface TimelineCardProps {
    trip: Trip;
}

export default function TimelineCard({ trip }: TimelineCardProps) {
    const firstLocation = trip.optimizedRoute?.ordered_route?.[0]?.name || 'Unknown location';
    const tripDate = new Date(trip.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <Card
            sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: 1,
                transition: 'all 0.2s',
                '&:hover': {
                    boxShadow: 3,
                    transform: 'translateX(4px)'
                },
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: -32,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: '#ea580c',
                    border: '3px solid white',
                    boxShadow: 1
                }
            }}
        >
            <CardContent sx={{ display: 'flex', gap: 2, p: 2 }}>
                {trip.images && trip.images[0] && (
                    <Box
                        component="img"
                        src={trip.images[0]}
                        alt={trip.title}
                        sx={{
                            width: 100,
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 2,
                            flexShrink: 0
                        }}
                    />
                )}

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {trip.title || 'Untitled Trip'}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6b7280' }}>
                            <MapPin size={16} />
                            <Typography variant="body2">{firstLocation}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6b7280' }}>
                            <Calendar size={16} />
                            <Typography variant="body2">{tripDate}</Typography>
                        </Box>
                    </Box>

                    {trip.activities && trip.activities.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                            {trip.activities.slice(0, 3).map((activity, idx) => (
                                <Chip
                                    key={idx}
                                    label={activity}
                                    size="small"
                                    sx={{
                                        bgcolor: '#fff7ed',
                                        color: '#ea580c',
                                        fontWeight: 500,
                                        fontSize: '0.75rem'
                                    }}
                                />
                            ))}
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, color: '#9ca3af' }}>
                        {trip.likes !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Heart size={14} />
                                <Typography variant="caption">{trip.likes}</Typography>
                            </Box>
                        )}
                        {trip.views !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Eye size={14} />
                                <Typography variant="caption">{trip.views}</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
