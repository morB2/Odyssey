import { useState, useEffect } from 'react';
import { Container, Box, CircularProgress } from '@mui/material';
import { useUserStore } from '../../store/userStore';
import { useSearchParams } from 'react-router-dom';
import WorldMap, { type MapMarker } from './WorldMap';
import { getJourneyMapData } from '../../services/journey.service';
import { toast } from 'react-toastify';

interface JourneyPageProps {
    userId?: string; // Optional userId prop for when embedded in Profile
}

export default function JourneyPage({ userId: propUserId }: JourneyPageProps = {}) {
    const { user } = useUserStore();
    const [searchParams] = useSearchParams();
    const userIdFromUrl = searchParams.get('userId');
    const targetUserId = propUserId || userIdFromUrl || user?._id;

    const [loading, setLoading] = useState(true);
    const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);

    useEffect(() => {
        if (!targetUserId) return;

        const fetchJourneyData = async () => {
            try {
                setLoading(true);

                const mapRes = await getJourneyMapData(targetUserId);
                setMapMarkers(mapRes.markers || []);
            } catch (error) {
                console.error('Error fetching journey:', error);
                toast.error('Failed to load journey');
            } finally {
                setLoading(false);
            }
        };

        fetchJourneyData();
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

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {mapMarkers.length >= 0 && (
                <Box sx={{ mb: 4 }}>
                    <WorldMap markers={mapMarkers} />
                </Box>
            )}
        </Container>
    );
}
