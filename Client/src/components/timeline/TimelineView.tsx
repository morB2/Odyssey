import { Box, Typography } from '@mui/material';
import TimelineCard from './TimelineCard';

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

interface GroupedTrips {
    [year: string]: {
        [month: string]: Trip[];
    };
}

interface TimelineViewProps {
    grouped: GroupedTrips;
}

export default function TimelineView({ grouped }: TimelineViewProps) {
    // Safety check for undefined/null grouped object
    if (!grouped || typeof grouped !== 'object') {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                    No trips yet
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    Start your journey by creating your first trip!
                </Typography>
            </Box>
        );
    }

    const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

    if (years.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                    No trips yet
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    Start your journey by creating your first trip!
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ position: 'relative', pl: 4 }}>
            {/* Vertical timeline line */}
            <Box
                sx={{
                    position: 'absolute',
                    left: 12,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    bgcolor: '#e5e7eb'
                }}
            />

            {years.map((year) => (
                <Box key={year} sx={{ mb: 6 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            mb: 3,
                            color: '#1f2937',
                            position: 'relative'
                        }}
                    >
                        {year}
                    </Typography>

                    {Object.entries(grouped[year]).map(([month, trips]) => (
                        <Box key={month} sx={{ mb: 4 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#6b7280',
                                    fontWeight: 600,
                                    mb: 2,
                                    ml: 1
                                }}
                            >
                                {month}
                            </Typography>

                            {trips.map((trip) => (
                                <TimelineCard key={trip._id} trip={trip} />
                            ))}
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
}
