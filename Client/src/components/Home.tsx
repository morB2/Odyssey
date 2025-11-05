import React from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Link,
} from '@mui/material';
import {
  Map,
  Sparkles,
  Calendar,
  DollarSign,
  Route,
  Cloud,
  Hotel,
  Heart,
  Users,
  Globe,
  Award,
} from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Home: React.FC = () => {
  const features: Feature[] = [
    { icon: <Route style={{ color: '#b45309', width: 32, height: 32 }} />, title: "Smart Route Planning", description: "Our AI algorithm calculates the most efficient routes between destinations, saving you time and maximizing your adventure." },
    { icon: <Cloud style={{ color: '#b45309', width: 32, height: 32 }} />, title: "Real-Time Weather", description: "Get accurate weather forecasts for your destinations so you can pack right and plan activities accordingly." },
    { icon: <Hotel style={{ color: '#b45309', width: 32, height: 32 }} />, title: "Accommodation Finder", description: "Discover and book the perfect places to stay that match your budget and preferences, all in one place." },
    { icon: <Map style={{ color: '#b45309', width: 32, height: 32 }} />, title: "Local Attractions", description: "Explore curated lists of must-see attractions, hidden gems, and local experiences at every destination." },
    { icon: <DollarSign style={{ color: '#b45309', width: 32, height: 32 }} />, title: "Budget Optimization", description: "Set your budget and let us help you make the most of it with smart recommendations and cost-effective options." },
    { icon: <Calendar style={{ color: '#b45309', width: 32, height: 32 }} />, title: "Flexible Scheduling", description: "Create day-by-day itineraries that adapt to your pace, with the flexibility to adjust plans on the go." },
  ];

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      {/* Header */}
      <AppBar position="absolute" elevation={0} sx={{ background: 'transparent' }}>
        <Toolbar sx={{ px: { xs: 2, md: 6 }, py: 2, justifyContent: 'space-between' }}>

          {/* Left side: Logo */}
          <Box component="img" src="/logo-white.png" alt="Odyssey Logo" sx={{ height: { xs: 90, md: 110 }, objectFit: 'contain' }} />

          {/* Right side: Links + Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, mr: 3 }}>
              <Link href="#features" underline="none" sx={{ color: 'white', '&:hover': { color: '#fcd34d' }, transition: 'color 0.3s' }}>Features</Link>
              <Link href="#about" underline="none" sx={{ color: 'white', '&:hover': { color: '#fcd34d' }, transition: 'color 0.3s' }}>About</Link>
            </Box>
            <Button variant="text" sx={{ color: 'white', mr: 1, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}>Log In</Button>
            <Button variant="contained" sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' }, fontWeight: 600 }}>Sign Up</Button>
          </Box>

        </Toolbar>
      </AppBar>


      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBhZHZlbnR1cmUlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzYyMjQ4NjMwfDA&ixlib=rb-4.1.0&q=80&w=1080)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::before': { content: '""', position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.8))' }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, textAlign: 'center', px: 3, top:'10%' }}>
          <Typography
            variant="h1"
            sx={{
              color: 'white',
              mb: 3,
              fontFamily: "'Syncopate', sans-serif;",
              fontSize: { xs: '4rem', md: '6rem' },
              lineHeight: 1.1,
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            Odyssey
          </Typography>

          <Typography variant="h1" sx={{ color: 'white', mb: 3, fontWeight: 700, fontSize: { xs: '2.5rem', md: '3.75rem' }, lineHeight: 1.1 }}>Your Journey, Perfectly Planned</Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 6, maxWidth: '800px', mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}>
            Discover the world with confidence. Odyssey creates personalized itineraries tailored to your preferences, budget, and travel style—all powered by intelligent algorithms and real-time data.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', mb: 10 }}>
            <Button variant="contained" size="large" startIcon={<Sparkles style={{ width: 20, height: 20 }} />} sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' }, px: 4, py: 1.5, fontSize: '1.125rem', fontWeight: 600 }}>Plan Your Trip</Button>
            <Button variant="outlined" size="large" sx={{ borderColor: 'white', color: 'white', '&:hover': { bgcolor: 'white', color: 'black', borderColor: 'white' }, px: 4, py: 1.5, fontSize: '1.125rem', fontWeight: 600, borderWidth: 2 }}>How It Works</Button>
          </Box>

          {/* Hero Stats */}
          <Grid container spacing={4} sx={{ maxWidth: '800px', mx: 'auto' }}>
            <Grid size={{ xs: 4 }}>
              <Typography variant="h3" sx={{ color: 'white', mb: 1, fontWeight: 700 }}>50K+</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Trips Planned</Typography>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Typography variant="h3" sx={{ color: 'white', mb: 1, fontWeight: 700 }}>120+</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Countries</Typography>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Typography variant="h3" sx={{ color: 'white', mb: 1, fontWeight: 700 }}>4.9★</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>User Rating</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: 12, px: { xs: 3, md: 6 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
           <Chip label="What We Offer" sx={{ mb: 2, bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: '1.25rem', px: 3, py: 1.5, borderRadius: '12px' }} />
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, fontSize: { xs: '2rem', md: '3rem' } }}>Everything You Need for the Perfect Trip</Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '800px', mx: 'auto', fontWeight: 400 }}>From route optimization to real-time updates, Odyssey brings together all the tools you need to plan, customize, and enjoy unforgettable journeys.</Typography>
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

      {/* About Section */}
      <Box id="about" sx={{ py: 12, px: { xs: 3, md: 6 }, background: 'linear-gradient(to bottom, #f9fafb, white)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid size={{ xs: 12, lg: 6 }}>
              <Chip label="Our Mission" sx={{   mb: 2,  bgcolor: '#fef3c7',  color: '#92400e', fontWeight: 600, fontSize: '1.1rem',  py: 1,  }} />
              <Typography variant="h2" sx={{ mb: 3, fontWeight: 700, fontSize: { xs: '2rem', md: '2.5rem' }, lineHeight: 1.2 }}>Making Travel Planning Simple and Accessible for Everyone</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, fontSize: '1.125rem', lineHeight: 1.7 }}>At Odyssey, we believe that everyone deserves to explore the world without the stress of complicated planning. Our platform combines cutting-edge AI technology with real-world travel expertise to deliver personalized itineraries that match your unique preferences.</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, fontSize: '1.125rem', lineHeight: 1.7 }}>Whether you're a solo adventurer, a family seeking new experiences, or a couple looking for romance, Odyssey helps you discover destinations, optimize routes, find accommodations, and create memories that last a lifetime.</Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ p: 1, bgcolor: '#fef3c7', borderRadius: 2, height: 'fit-content' }}><Heart style={{ width: 20, height: 20, color: '#b45309' }} /></Box>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>Personalized Experiences</Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>Every trip is unique, crafted around your interests and travel style.</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ p: 1, bgcolor: '#fef3c7', borderRadius: 2, height: 'fit-content' }}><Globe style={{ width: 20, height: 20, color: '#b45309' }} /></Box>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>Global Coverage</Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>Explore destinations across the world with comprehensive data and insights.</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ p: 1, bgcolor: '#fef3c7', borderRadius: 2, height: 'fit-content' }}><Award style={{ width: 20, height: 20, color: '#b45309' }} /></Box>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>Trusted by Travelers</Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>Join thousands of happy travelers who've discovered their perfect journeys with us.</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ position: 'relative' }}>
                <Box component="img" src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHRyYXZlbGVyfGVufDF8fHx8MTc2MjI0ODYzMHww&ixlib=rb-4.1.0&q=80&w=1080" alt="Happy traveler" sx={{ width: '100%', height: 600, objectFit: 'cover', borderRadius: 4, boxShadow: 8 }} />
                <Card sx={{ position: 'absolute', bottom: -32, left: -32, p: 3, display: 'flex', gap: 2, alignItems: 'center', boxShadow: 8 }}>
                  <Users style={{ width: 48, height: 48, color: '#b45309' }} />
                  <Box>
                    <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>50,000+</Typography>
                    <Typography color="text.secondary">Happy Travelers</Typography>
                  </Box>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      {/* Footer Section */}
      <Box sx={{ py: 12, px: { xs: 3, md: 6 }, background: 'linear-gradient(135deg, #d97706, #b45309)' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ color: 'white', mb: 3, fontWeight: 700, fontSize: { xs: '2rem', md: '3rem' } }}>Ready to Start Your Adventure?</Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 5, fontWeight: 400, lineHeight: 1.6 }}>Join thousands of travelers who have discovered their perfect journeys with Odyssey. Start planning your next trip today—it only takes a few minutes.</Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" size="large" startIcon={<Sparkles style={{ width: 20, height: 20 }} />} sx={{ bgcolor: 'white', color: '#b45309', '&:hover': { bgcolor: '#f3f4f6' }, px: 4, py: 1.5, fontSize: '1.125rem', fontWeight: 600 }}>Plan Your Trip Now</Button>
            <Button variant="outlined" size="large" sx={{ borderColor: 'white', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' }, px: 4, py: 1.5, fontSize: '1.125rem', fontWeight: 600, borderWidth: 2 }}>Learn More</Button>
          </Box>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#111827', color: 'white', py: 8, px: { xs: 3, md: 6 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ mb: 6 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, letterSpacing: 1 }}>ODYSSEY</Typography>
              <Typography sx={{ color: '#9ca3af', mb: 3, maxWidth: 400, lineHeight: 1.7 }}>Your journey, perfectly planned. Discover the world with AI-powered trip planning that adapts to your unique travel style.</Typography>
              <Typography sx={{ color: '#6b7280' }}>© 2025 Odyssey. All rights reserved.</Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Explore</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>Features</Link>
                <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>Pricing</Link>
                <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>About</Link>
                <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>Blog</Link>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Support</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>Help Center</Link>
                <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>Terms of Service</Link>
                <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>Privacy Policy</Link>
                <Link href="#" underline="hover" sx={{ color: '#9ca3af' }}>Contact</Link>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
