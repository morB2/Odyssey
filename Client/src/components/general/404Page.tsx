import React from 'react';
import { Container, Typography, Button, Box, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Define the custom colors for easy reuse
const ODYSSEY_ORANGE = '#FF8C00';
const ODYSSEY_DARK_TEXT = '#1A1A1A';

/**
 * Renders the 404 Not Found error page for the Odyssey website.
 * This component is exported by name.
 */
export const Page404: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white', // Pure white background
        p: 4, // Padding
      }}
    >
      <Box sx={{ textAlign: 'center', py: 8 }}>
        {/* Error Code */}
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '8rem', md: '10rem' }, // Responsive font size
            fontWeight: 'extrabold',
            color: ODYSSEY_ORANGE,
            mb: 4
          }}
        >
          404
        </Typography>

        {/* Title */}
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 'bold',
            color: ODYSSEY_DARK_TEXT,
            mb: 2
          }}
        >
          {t('404.title')}
        </Typography>

        {/* Body Text */}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: 5,
            maxWidth: '500px',
            mx: 'auto'
          }}
        >
          {t('404.description')}
        </Typography>

        {/* Call to Action Buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            href="/"
            variant="contained"
            sx={{
              backgroundColor: ODYSSEY_ORANGE,
              '&:hover': { backgroundColor: '#E57F00' }, // Darker orange on hover
              color: 'white',
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              borderRadius: '12px'
            }}
          >
            {t('404.returnHome')}
          </Button>
          <Button
            href="/feed"
            variant="outlined"
            sx={{
              borderColor: ODYSSEY_ORANGE,
              color: ODYSSEY_ORANGE,
              '&:hover': {
                backgroundColor: ODYSSEY_ORANGE,
                color: 'white',
                borderColor: ODYSSEY_ORANGE
              },
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              borderRadius: '12px'
            }}
          >
            {t('404.exploreTrips')}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Page404