import React from 'react';
import { Box, Container, Grid, Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
    return (
        <Box sx={{
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            bgcolor: '#111827',
            color: 'white',
            py: 8,
            px: { xs: 3, md: 6 },
            mt: 'auto' // Ensure it pushes to bottom if in a flex container
        }}>
            <Container maxWidth="lg">
                <Grid container spacing={6} sx={{ mb: 6 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, letterSpacing: 1 }}>ODYSSEY</Typography>
                        <Typography sx={{ color: '#9ca3af', mb: 3, maxWidth: 400, lineHeight: 1.7 }}>A social travel platform to plan trips, share adventures, and connect with fellow travelers.</Typography>
                        <Typography sx={{ color: '#6b7280' }}>© 2025 Odyssey. All rights reserved.</Typography>
                    </Grid>

                    <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Explore</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Link href="/feed" underline="hover" sx={{ color: '#9ca3af' }}>Feed</Link>
                            <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>Destinations</Link>
                            <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>Groups</Link>
                            <Link href="/createtrip" underline="hover" sx={{ color: '#9ca3af' }}>Plan Trip</Link>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Support</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Link href="/help" underline="hover" sx={{ color: '#9ca3af' }}>Help Center</Link>
                            <Link href="/terms" underline="hover" sx={{ color: '#9ca3af' }}>Terms of Service</Link>
                            <Link href="/privacy" underline="hover" sx={{ color: '#9ca3af' }}>Privacy Policy</Link>
                            <Link href="/contact" underline="hover" sx={{ color: '#9ca3af' }}>Contact</Link>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Footer;
