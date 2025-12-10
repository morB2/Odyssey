import { Backpack, Car, Tent, Camera } from 'lucide-react';
import { Box, styled } from '@mui/material';

interface PathConnectorProps {
  fromPosition: number;
  toPosition: number;
  width: number;
}

const icons = [Backpack, Car, Tent, Camera];

// --- Styled Components ---

const RootContainer = styled(Box)<{ width: number }>(({ width }) => ({
  position: 'relative',
  height: '100%',
  width: `${width}px`,
}));

const IconContainer = styled(Box)({
  position: 'absolute',
  backgroundColor: '#ffedd5', // orange-100
  padding: 8, // p-2
  borderRadius: '50%', // rounded-full
  zIndex: 10,
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.04)', // shadow-md
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

// --- Component ---

export function PathConnector({ fromPosition, toPosition, width }: PathConnectorProps) {
  const Icon = icons[Math.floor(Math.random() * icons.length)];

  // Curve path calculation
  const startY = fromPosition;
  const endY = toPosition;
  const midX = width / 2;

  // Control points for cubic Bezier curve
  const controlPoint1X = midX * 0.3;
  const controlPoint1Y = startY;
  const controlPoint2X = width - (midX * 0.3); 
  const controlPoint2Y = endY;

  // SVG Path Data
  const pathD = `M 0 ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${width} ${endY}`;
  
  // Icon position calculation (middle of the line)
  const iconTop = (startY + endY) / 2;

  return (
    <RootContainer width={width}>
      <Box
        component="svg"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          zIndex: 0,
        }}
      >
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        {/* The Curved Path */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="3"
          strokeDasharray="8,8"
          strokeLinecap="round"
        />

        {/* Start dot */}
        <circle cx="0" cy={startY} r="6" fill="#f97316" stroke="white" strokeWidth="3" />
        
        {/* End dot */}
        <circle cx={width} cy={endY} r="6" fill="#f97316" stroke="white" strokeWidth="3" />
      </Box>

      {/* Icon in the middle */}
      <IconContainer
        sx={{
          left: `${midX}px`,
          top: `${iconTop}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Icon 
          size={16}
          color="#ea580c"
        />
      </IconContainer>
    </RootContainer>
  );
}