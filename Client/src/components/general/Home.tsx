import React, { type FC } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Chip, Button, Link, } from '@mui/material';
import { Map, Sparkles, Calendar, DollarSign, Route, Heart, Users, Globe, } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Navbar } from './Navbar';


interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const Home: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features: Feature[] = [
    { icon: <Route style={{ color: '#b45309', width: 32, height: 32 }} />, title: t('smart_route_planning'), description: t('smart_route_desc') },
    { icon: <Calendar style={{ color: '#b45309', width: 32, height: 32 }} />, title: t('flexible_scheduling'), description: t('flexible_scheduling_desc') },
    { icon: <DollarSign style={{ color: '#b45309', width: 32, height: 32 }} />, title: t('budget_optimization'), description: t('budget_optimization_desc') },
    { icon: <Users style={{ color: '#b45309', width: 32, height: 32 }} />, title: t('traveler_feed'), description: t('traveler_feed_desc') },
    { icon: <Heart style={{ color: '#b45309', width: 32, height: 32 }} />, title: t('share_your_journey'), description: t('share_your_journey_desc') },
    { icon: <Globe style={{ color: '#b45309', width: 32, height: 32 }} />, title: t('global_connections'), description: t('global_connections_desc') },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      margin: 0,
      padding: 0,
    }}>
      <Navbar />

      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        height: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBhZHZlbnR1cmUlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzYyMjQ4NjMwfDA&ixlib=rb-4.1.0&q=80&w=1080)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        '&::before': { content: '""', position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, textAlign: 'center', px: 3 }}>
          <Typography
            variant="h1"
            sx={{
              color: 'white',
              mb: 3,
              fontFamily: "'Syncopate', sans-serif;",
              fontSize: { xs: '3.5rem', md: '5rem' },
              lineHeight: 1.1,
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            Odyssey
          </Typography>
          <Typography variant="h4" sx={{ color: 'white', mb: 3, fontWeight: 700 }}>{t('plan_share_explore')}</Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 6, maxWidth: '700px', mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}>
            {t('odyssey_description')}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', mb: 8 }}>
            <Button onClick={() => navigate('/createtrip')} variant="contained" size="large" startIcon={<Sparkles style={{ width: 20, height: 20 }} />} sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' }, px: 4, py: 1.5, fontSize: '1.125rem', fontWeight: 600 }}>{t('plan_your_trip')}</Button>
            <Button onClick={() => navigate('/feed')} variant="outlined" size="large" sx={{ borderColor: 'white', color: 'white', '&:hover': { bgcolor: 'white', color: 'black', borderColor: 'white' }, px: 4, py: 1.5, fontSize: '1.125rem', fontWeight: 600, borderWidth: 2 }}>{t('explore_feed')}</Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        py: 12,
        px: { xs: 3, md: 6 },
        bgcolor: 'white'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label={t('what_we_offer')} sx={{ mb: 2, bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: '1.25rem', px: 3, py: 1.5, borderRadius: '12px' }} />
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, fontSize: { xs: '2rem', md: '3rem' } }}>{t('plan_smarter_share')}</Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '800px', mx: 'auto', fontWeight: 400 }}>{t('features_description')}</Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
                <Card sx={{ height: '100%', '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' }, transition: 'all 0.3s ease' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>{feature.title}</Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>{feature.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Community Section */}
      <Box id="community" sx={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        py: 12,
        px: { xs: 3, md: 6 },
        background: 'linear-gradient(to bottom, #f9fafb, white)'
      }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ mb: 3, fontWeight: 700 }}>{t('join_travel_community')}</Typography>
          <Typography variant="h6" sx={{ mb: 8, color: 'text.secondary', maxWidth: '700px', mx: 'auto' }}>
            {t('community_description')}
          </Typography>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}><Users style={{ width: 32, height: 32, color: '#b45309' }} /></Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>{t('connect_with_friends')}</Typography>
                <Typography color="text.secondary">{t('connect_with_friends_desc')}</Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}><Heart style={{ width: 32, height: 32, color: '#b45309' }} /></Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>{t('share_your_moments')}</Typography>
                <Typography color="text.secondary">{t('share_your_moments_desc')}</Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}><Map style={{ width: 32, height: 32, color: '#b45309' }} /></Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>{t('plan_trips_together')}</Typography>
                <Typography color="text.secondary">{t('plan_trips_together_desc')}</Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        py: 12,
        px: { xs: 3, md: 6 },
        background: 'linear-gradient(135deg, #d97706, #b45309)'
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ color: 'white', mb: 3, fontWeight: 700 }}>{t('start_planning_sharing')}</Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 5, fontWeight: 400, lineHeight: 1.6 }}>{t('join_odyssey_description')}</Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
            <Button onClick={() => navigate('/createtrip')} variant="contained" size="large" startIcon={<Sparkles style={{ width: 20, height: 20 }} />} sx={{ bgcolor: 'white', color: '#b45309', '&:hover': { bgcolor: '#f3f4f6' }, px: 4, py: 1.5, fontSize: '1.125rem', fontWeight: 600 }}>{t('plan_your_trip')}</Button>
            <Button onClick={() => navigate('/feed')} variant="outlined" size="large" sx={{ borderColor: 'white', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' }, px: 4, py: 1.5, fontSize: '1.125rem', fontWeight: 600, borderWidth: 2 }}>{t('explore_feed')}</Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        bgcolor: '#111827',
        color: 'white',
        py: 8,
        px: { xs: 3, md: 6 }
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ mb: 6 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, letterSpacing: 1 }}>ODYSSEY</Typography>
              <Typography sx={{ color: '#9ca3af', mb: 3, maxWidth: 400, lineHeight: 1.7 }}>{t('footer_description')}</Typography>
              <Typography sx={{ color: '#6b7280' }}>© 2025 Odyssey. All rights reserved.</Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>{t('explore')}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>{t('feed')}</Link>
                <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>{t('destinations')}</Link>
                <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>{t('groups')}</Link>
                <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>{t('plan_trip')}</Link>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>{t('support')}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>{t('help_center')}</Link>
                <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>{t('terms_of_service')}</Link>
                <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>{t('privacy_policy')}</Link>
                <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>{t('contact')}</Link>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

