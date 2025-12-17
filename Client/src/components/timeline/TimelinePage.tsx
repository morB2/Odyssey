import { useState, useEffect } from 'react';
import { Container, Box, Typography, CircularProgress, Divider } from '@mui/material';
import { useUserStore } from '../../store/userStore';
import { useSearchParams } from 'react-router-dom';
import WorldMap, { type MapMarker } from './WorldMap';
import TravelStats, { type TravelStatistics } from './TravelStats';
import TimelineView from './TimelineView';
import { getTimeline, getTimelineMapData } from '../../services/timeline.service';
import { toast } from 'react-toastify';

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
        ordered_route?: Array<{ name: string; lat: number; lon: number }>;
    };
}

interface GroupedTrips {
    [year: string]: {
        [month: string]: Trip[];
    };
}

interface TimelineData {
    trips: Trip[];
    grouped: GroupedTrips;
    stats: TravelStatistics;
}

interface TimelinePageProps {
    userId?: string; // Optional userId prop for when embedded in Profile
}

export default function TimelinePage({ userId: propUserId }: TimelinePageProps = {}) {
    const { user } = useUserStore();
    const [searchParams] = useSearchParams();
    const userIdFromUrl = searchParams.get('userId');
    const targetUserId = propUserId || userIdFromUrl || user?._id;

    const [loading, setLoading] = useState(true);
    const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
    const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);

    useEffect(() => {
        if (!targetUserId) return;

        const fetchTimelineData = async () => {
            try {
                setLoading(true);

                // Fetch timeline data using service
                // const timelineRes = await getTimeline(targetUserId);
                // setTimelineData(timelineRes);

                // Fetch map markers using service
                const mapRes = await getTimelineMapData(targetUserId);
                setMapMarkers(mapRes.markers || []);
            } catch (error) {
                console.error('Error fetching timeline:', error);
                toast.error('Failed to load timeline');
            } finally {
                setLoading(false);
            }
        };

        fetchTimelineData();
    }, [targetUserId]);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <CircularProgress sx={{ color: '#ea580c' }} />
                </Box>
            </Container>
        );
    }

    if (!mapMarkers) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h6" sx={{ textAlign: 'center', color: '#6b7280' }}>
                    Failed to load timeline
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* World Map */}
            {mapMarkers.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <WorldMap markers={mapMarkers} />
                </Box>
            )}

            {/* <Divider sx={{ my: 4 }} />

            {timelineData.stats && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                        Travel Statistics
                    </Typography>
                    <TravelStats stats={timelineData.stats} />
                </Box>
            )}

            <Divider sx={{ my: 4 }} />

            {timelineData.grouped && (
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                        Timeline
                    </Typography>
                    <TimelineView grouped={timelineData.grouped} />
                </Box>
            )} */}
        </Container>
    );
}
