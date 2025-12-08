import { Box, Typography, styled } from '@mui/material';
import { ChevronDown, MapPin } from 'lucide-react';

interface RoutePreviewProps {
  title: string;
  tripCount: number;
  firstTripImage: string;
  onClick: () => void;
}

// --- Styled Components ---

const RootBox = styled(Box)(({ theme }) => ({
  // Tailwind equivalent: bg-white rounded-2xl shadow-xl overflow-hidden
  backgroundColor: theme.palette.common.white,
  borderRadius: theme.spacing(2), // 2xl is typically 16px
  overflow: 'hidden',
  boxShadow: theme.shadows[10], // Approximate shadow-xl
  cursor: 'pointer',
  transition: theme.transitions.create(['box-shadow', 'transform']),
  maxWidth: theme.breakpoints.values.md, // max-w-md
  margin: 'auto', // mx-auto
  
  // Tailwind equivalent: hover:shadow-2xl transition-all
  '&:hover': {
    boxShadow: theme.shadows[18], // Approximate shadow-2xl
  },
}));

const ImageContainer = styled(Box)({
  // Tailwind equivalent: h-64 overflow-hidden relative
  height: 256, // h-64
  overflow: 'hidden',
  position: 'relative',
});

const BottomBar = styled(Box)(({ theme }) => ({
  // Tailwind equivalent: p-6 bg-gradient-to-b from-orange-50 to-white
  padding: theme.spacing(3),
  background: 'linear-gradient(to bottom, #fff7ed, white)', // Equivalent to from-orange-50
}));

// -------------------------

export function RoutePreview({ title, tripCount, firstTripImage, onClick }: RoutePreviewProps) {
  return (
    <RootBox onClick={onClick}>
      <ImageContainer>
        {/* Image */}
        <Box 
          component="img"
          src={firstTripImage} 
          alt={title}
          sx={{
            // Tailwind equivalent: w-full h-full object-cover
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        
        {/* Gradient Overlay */}
        <Box 
          sx={{
            // Tailwind equivalent: absolute inset-0 bg-gradient-to-t from-black/60 to-transparent
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent)',
          }}
        />

        {/* Text Content */}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 3, color: 'white' }}>
          <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255, 255, 255, 0.9)' /* text-white/90 */ }}>
            <MapPin size={20} />
            <Typography variant="body1">
              {tripCount} trips in route
            </Typography>
          </Box>
        </Box>
      </ImageContainer>

      {/* Footer CTA */}
      <BottomBar>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: '#ea580c' /* text-orange-600 */ }}>
          <Typography variant="subtitle1" component="span" fontWeight="medium">
            Click to view full route
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              '@keyframes bounce': {
                '0%, 100%': { transform: 'translateY(-25%)' },
                '50%': { transform: 'translateY(0)' },
              },
              animation: 'bounce 1s infinite',
            }}
          >
            <ChevronDown size={20} />
          </Box>
        </Box>
      </BottomBar>
    </RootBox>
  );
}