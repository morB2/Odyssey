import { Card, CardContent, Typography, Button, Stack, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface GuestWelcomeCardProps {
    onViewAsGuest: () => void;
}

export default function GuestWelcomeCard({ onViewAsGuest }: GuestWelcomeCardProps) {
    const navigate = useNavigate();

    return (
        <Card
            sx={{
                maxWidth: { xs: '100%', sm: 600, md: 700 },
                mx: 'auto',
                mb: 3,
                borderRadius: '16px',
                boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                bgcolor: 'background.paper',
                marginTop: '20%'
            }}
        >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Welcome to Odyssey
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Join our community to share your adventures, interact with other travelers, and discover amazing trips.
                </Typography>

                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    justifyContent="center"
                    alignItems="center"
                >
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/login')}
                        sx={{
                            px: 4,
                            borderRadius: '24px',
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                            bgcolor: '#d97706',
                            '&:hover': { bgcolor: '#b45309' },
                        }}
                    >
                        Sign In / Sign Up
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={onViewAsGuest}
                        sx={{
                            px: 4,
                            borderRadius: '24px',
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                            color:'#d97706',
                            borderColor: '#d97706',
                        }}
                    >
                        View as Guest
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
