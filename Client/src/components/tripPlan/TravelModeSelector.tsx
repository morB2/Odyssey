// TravelModeSelector.tsx
import { Paper, Stack, Button } from '@mui/material';

export function TravelModeSelector({ onSelectMode }: { onSelectMode: (mode: string) => void }) {
  return (
    <Paper
      sx={{
        bgcolor: '#fff7ed',
        border: '1px solid #ffe4cc',
        p: 2,
        borderRadius: 3,
        maxWidth: '80%',
      }}
    >
      <Stack direction="row" flexWrap="wrap" gap={1.5}>
        {['Driving 🚗', 'Walking 🚶‍♀️', 'Transit 🚌'].map((mode) => (
          <Button
            key={mode}
            onClick={() => onSelectMode(mode.split(' ')[0])} 
            sx={{
              borderRadius: '9999px', border: '1px solid #ffccaa', color: '#ff6b35', backgroundColor: 'white', textTransform: 'none', px: 2.5,
              py: 0.8, fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              '&:hover': {
                backgroundColor: '#fff2e6', transform: 'scale(1.03)', transition: '0.15s ease-in-out',
              },
            }}
            variant="outlined"
          >
            {mode}
          </Button>
        ))}
      </Stack>
    </Paper>
  );
}