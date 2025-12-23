import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button, Container } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import TripPost from './TripPost';
import { getTripById } from '../../services/tripPost.service';
import { type Trip } from './types';
import { useUserStore } from '../../store/userStore';
import { useTranslation } from 'react-i18next';

export default function SinglePostPage() {
    const { postId } = useParams<{ postId: string }>();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUserStore();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchTrip = async () => {
            if (!postId) return;
            try {
                setLoading(true);
                const data = await getTripById(postId, user?._id);
                setTrip(data);
            } catch (err) {
                console.error("Error fetching trip:", err);
                setError("Failed to load post");
            } finally {
                setLoading(false);
            }
        };

        fetchTrip();
    }, [postId, user?._id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !trip) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="80vh" gap={2}>
                <Typography variant="h6" color="error">
                    {error || t('social.postNotFound')}
                </Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <TripPost trip={trip} />
        </Container>
    );
}
