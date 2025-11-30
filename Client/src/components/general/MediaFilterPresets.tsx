import { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { applyImageFilter, getOriginalCloudinaryUrl } from '../../utils/mediaUtils';
import type { ImageFilter } from '../../utils/mediaUtils';

interface MediaFilterPresetsProps {
    mediaUrl: string;
    onFilterApply: (filteredUrl: string) => void;
    currentFilter?: ImageFilter;
}

const FILTER_PRESETS: { name: ImageFilter; label: string; emoji: string }[] = [
    { name: 'none', label: 'Original', emoji: '📷' },
    { name: 'vintage', label: 'Vintage', emoji: '🎞️' },
    { name: 'bw', label: 'B&W', emoji: '⚫⚪' },
    { name: 'sepia', label: 'Sepia', emoji: '🟤' },
    { name: 'sharpen', label: 'Sharpen', emoji: '✨' },
    { name: 'blur', label: 'Blur', emoji: '🌫️' },
    { name: 'vibrant', label: 'Vibrant', emoji: '🌈' },
    { name: 'artistic', label: 'Artistic', emoji: '🎨' },
];

export function MediaFilterPresets({ mediaUrl, onFilterApply, currentFilter = 'none' }: MediaFilterPresetsProps) {
    const [selectedFilter, setSelectedFilter] = useState<ImageFilter>(currentFilter);
    const [previewUrl, setPreviewUrl] = useState(mediaUrl);
    const [originalUrl] = useState(() => getOriginalCloudinaryUrl(mediaUrl));

    // Reset preview when mediaUrl changes
    useEffect(() => {
        const cleanUrl = getOriginalCloudinaryUrl(mediaUrl);
        setPreviewUrl(cleanUrl);
        setSelectedFilter('none');
    }, [mediaUrl]);

    const handleFilterClick = (filter: ImageFilter) => {
        setSelectedFilter(filter);

        if (filter === 'none') {
            setPreviewUrl(originalUrl);
        } else {
            const filteredUrl = applyImageFilter(originalUrl, filter);
            setPreviewUrl(filteredUrl);
        }
    };

    const handleApply = () => {
        onFilterApply(previewUrl);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            {/* Preview Image - Large and prominent */}
            <Box
                sx={{
                    width: '100%',
                    aspectRatio: '16/9',
                    backgroundColor: '#000',
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
            >
                <img
                    key={previewUrl}
                    src={previewUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={() => {
                        if (previewUrl !== originalUrl) {
                            setPreviewUrl(originalUrl);
                        }
                    }}
                />
            </Box>

            {/* Filter Buttons - Compact below image */}
            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#171717' }}>
                    Choose Filter:
                </Typography>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 1,
                    }}
                >
                    {FILTER_PRESETS.map((preset) => (
                        <Button
                            key={preset.name}
                            onClick={() => handleFilterClick(preset.name)}
                            variant={selectedFilter === preset.name ? 'contained' : 'outlined'}
                            sx={{
                                flexDirection: 'column',
                                p: 1,
                                minHeight: '60px',
                                borderColor: selectedFilter === preset.name ? '#f97316' : '#d4d4d4',
                                backgroundColor: selectedFilter === preset.name ? '#f97316' : 'transparent',
                                color: selectedFilter === preset.name ? '#ffffff' : '#171717',
                                '&:hover': {
                                    borderColor: '#f97316',
                                    backgroundColor: selectedFilter === preset.name ? '#ea580c' : '#fff7ed',
                                },
                            }}
                        >
                            <Typography sx={{ fontSize: '1.5rem', mb: 0.25 }}>{preset.emoji}</Typography>
                            <Typography sx={{ fontSize: '0.7rem', textTransform: 'none', lineHeight: 1.2 }}>
                                {preset.label}
                            </Typography>
                        </Button>
                    ))}
                </Box>
            </Box>

            {/* Apply Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                <Button
                    onClick={handleApply}
                    variant="contained"
                    sx={{
                        backgroundColor: '#f97316',
                        '&:hover': { backgroundColor: '#ea580c' },
                        textTransform: 'none',
                        px: 3,
                    }}
                >
                    Apply Filter
                </Button>
            </Box>

            {selectedFilter !== 'none' && (
                <Box sx={{ p: 1.5, backgroundColor: '#fff7ed', borderRadius: 1, border: '1px solid #fed7aa' }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#9a3412' }}>
                        ✨ Preview: <strong>{FILTER_PRESETS.find(f => f.name === selectedFilter)?.label}</strong>
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
