// TravelModeSelector.tsx
import { Paper, Stack, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const TravelModeSelector = ({ onSelectMode }: { onSelectMode: (mode: string) => void }) => {
    const { t } = useTranslation();

    const travelModes = [
        { key: 'driving', label: t('travelModes.driving', 'Driving 🚗') },
        { key: 'walking', label: t('travelModes.walking', 'Walking 🚶‍♀️') },
        { key: 'transit', label: t('travelModes.transit', 'Transit 🚌') },
    ];

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
                {travelModes.map((mode) => (
                    <Button
                        key={mode.key}
                        onClick={() => onSelectMode(mode.key)}
                        sx={{
                            borderRadius: '9999px', border: '1px solid #ffccaa', color: '#ff6b35', backgroundColor: 'white', textTransform: 'none', px: 2.5,
                            py: 0.8, fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            '&:hover': {
                                backgroundColor: '#fff2e6', transform: 'scale(1.03)', transition: '0.15s ease-in-out',
                            },
                        }}
                        variant="outlined"
                    >
                        {mode.label}
                    </Button>
                ))}
            </Stack>
        </Paper>
    );
}