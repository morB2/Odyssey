import { Card, CardContent, Typography, Button, Stack, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

interface GuestWelcomeCardProps {
    onViewAsGuest: () => void;
}

const GuestWelcomeCard = ({ onViewAsGuest }: GuestWelcomeCardProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

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
                    {t('guestWelcome.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {t('guestWelcome.text')}
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
                        onClick={() => navigate('/login', { state: { backgroundLocation: location.pathname } })}
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
                        {t('guestWelcome.signIn')}
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
                            color: '#d97706',
                            borderColor: '#d97706',
                        }}
                    >
                        {t('guestWelcome.viewAsGuest')}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default GuestWelcomeCard;
