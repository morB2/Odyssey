import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Slider,
    IconButton,
    TextField,
    CircularProgress,
} from '@mui/material';
import { Close, RestartAlt } from '@mui/icons-material';
import {
    applyImageEffects,
    applyVideoTransformations,
    getOriginalCloudinaryUrl,
    isVideo,
} from '../../utils/mediaUtils';
import type { ImageEffects, VideoTransformations } from '../../utils/mediaUtils';

interface MediaEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    mediaUrl: string;
    onSave: (editedUrl: string) => void;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function MediaEditorModal({ isOpen, onClose, mediaUrl, onSave }: MediaEditorModalProps) {
    const isVideoMedia = isVideo(mediaUrl);
    const [originalUrl] = useState(() => getOriginalCloudinaryUrl(mediaUrl));

    // Image effects state
    const [imageEffects, setImageEffects] = useState<ImageEffects>({
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hue: 0,
        blur: 0,
        sharpen: 0,
        pixelate: 0,
        vignette: 0,
        vibrance: 0,
    });

    // Video transformations state
    const [videoTransforms, setVideoTransforms] = useState<VideoTransformations>({
        duration: undefined,
        startOffset: undefined,
        quality: 'auto:good',
        format: 'mp4',
        watermark: undefined,
    });

    const [watermarkText, setWatermarkText] = useState('');
    const [previewUrl, setPreviewUrl] = useState(originalUrl);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce effects to reduce URL updates
    const debouncedImageEffects = useDebounce(imageEffects, 300);
    const debouncedVideoTransforms = useDebounce(videoTransforms, 300);
    const debouncedWatermarkText = useDebounce(watermarkText, 500);

    // Update preview when debounced effects change
    useEffect(() => {
        setIsLoading(true);

        if (isVideoMedia) {
            const transformed = applyVideoTransformations(originalUrl, {
                ...debouncedVideoTransforms,
                watermark: debouncedWatermarkText ? { text: debouncedWatermarkText } : undefined,
            });
            setPreviewUrl(transformed);
        } else {
            const filtered = applyImageEffects(originalUrl, debouncedImageEffects);
            setPreviewUrl(filtered);
        }

        // Small delay to show loading state
        setTimeout(() => setIsLoading(false), 100);
    }, [debouncedImageEffects, debouncedVideoTransforms, debouncedWatermarkText, originalUrl, isVideoMedia]);

    const handleReset = () => {
        setImageEffects({
            brightness: 0,
            contrast: 0,
            saturation: 0,
            hue: 0,
            blur: 0,
            sharpen: 0,
            pixelate: 0,
            vignette: 0,
            vibrance: 0,
        });
        setVideoTransforms({
            duration: undefined,
            startOffset: undefined,
            quality: 'auto:good',
            format: 'mp4',
            watermark: undefined,
        });
        setWatermarkText('');
    };

    const handleSave = () => {
        onSave(previewUrl);
        onClose();
    };

    const handleImageEffectChange = useCallback((key: keyof ImageEffects, value: number | boolean) => {
        setImageEffects((prev) => ({ ...prev, [key]: value }));
    }, []);

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={600}>
                        {isVideoMedia ? 'Edit Video' : 'Edit Image'}
                    </Typography>
                    <Box>
                        <IconButton onClick={handleReset} title="Reset all" size="small">
                            <RestartAlt />
                        </IconButton>
                        <IconButton onClick={onClose} size="small">
                            <Close />
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 400px' }, gap: 3 }}>
                    {/* Left: Preview */}
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
                            position: 'relative',
                        }}
                    >
                        {isVideoMedia ? (
                            <video
                                key={previewUrl}
                                src={previewUrl}
                                controls
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        ) : (
                            <img
                                key={previewUrl}
                                src={previewUrl}
                                alt="Preview"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        )}
                        {isLoading && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    borderRadius: '50%',
                                    p: 1,
                                }}
                            >
                                <CircularProgress size={20} sx={{ color: '#fff' }} />
                            </Box>
                        )}
                    </Box>

                    {/* Right: Controls */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            maxHeight: { xs: 'auto', md: '500px' },
                            overflowY: 'auto',
                            pr: 1,
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: '#f1f1f1',
                                borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: '#888',
                                borderRadius: '4px',
                                '&:hover': {
                                    backgroundColor: '#555',
                                },
                            },
                        }}
                    >
                        {!isVideoMedia ? (
                            <>
                                <Typography variant="subtitle2" fontWeight={600} color="#171717">
                                    Basic Adjustments
                                </Typography>

                                <Box>
                                    <Typography variant="caption" gutterBottom>
                                        Brightness: {imageEffects.brightness}
                                    </Typography>
                                    <Slider
                                        value={imageEffects.brightness || 0}
                                        onChange={(_, value) => handleImageEffectChange('brightness', value as number)}
                                        min={-99}
                                        max={100}
                                        size="small"
                                        sx={{ color: '#f97316' }}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="caption" gutterBottom>
                                        Contrast: {imageEffects.contrast}
                                    </Typography>
                                    <Slider
                                        value={imageEffects.contrast || 0}
                                        onChange={(_, value) => handleImageEffectChange('contrast', value as number)}
                                        min={-100}
                                        max={100}
                                        size="small"
                                        sx={{ color: '#f97316' }}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="caption" gutterBottom>
                                        Saturation: {imageEffects.saturation}
                                    </Typography>
                                    <Slider
                                        value={imageEffects.saturation || 0}
                                        onChange={(_, value) => handleImageEffectChange('saturation', value as number)}
                                        min={-100}
                                        max={100}
                                        size="small"
                                        sx={{ color: '#f97316' }}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="caption" gutterBottom>
                                        Hue: {imageEffects.hue}
                                    </Typography>
                                    <Slider
                                        value={imageEffects.hue || 0}
                                        onChange={(_, value) => handleImageEffectChange('hue', value as number)}
                                        min={-100}
                                        max={100}
                                        size="small"
                                        sx={{ color: '#f97316' }}
                                    />
                                </Box>

                                <Typography variant="subtitle2" fontWeight={600} color="#171717" sx={{ mt: 2 }}>
                                    Advanced Effects
                                </Typography>

                                <Box>
                                    <Typography variant="caption" gutterBottom>
                                        Sharpen: {imageEffects.sharpen}
                                    </Typography>
                                    <Slider
                                        value={imageEffects.sharpen || 0}
                                        onChange={(_, value) => handleImageEffectChange('sharpen', value as number)}
                                        min={0}
                                        max={2000}
                                        size="small"
                                        sx={{ color: '#3b82f6' }}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="caption" gutterBottom>
                                        Blur: {imageEffects.blur}
                                    </Typography>
                                    <Slider
                                        value={imageEffects.blur || 0}
                                        onChange={(_, value) => handleImageEffectChange('blur', value as number)}
                                        min={0}
                                        max={2000}
                                        size="small"
                                        sx={{ color: '#3b82f6' }}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="caption" gutterBottom>
                                        Vignette: {imageEffects.vignette}
                                    </Typography>
                                    <Slider
                                        value={imageEffects.vignette || 0}
                                        onChange={(_, value) => handleImageEffectChange('vignette', value as number)}
                                        min={0}
                                        max={100}
                                        size="small"
                                        sx={{ color: '#3b82f6' }}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="caption" gutterBottom>
                                        Pixelate: {imageEffects.pixelate}
                                    </Typography>
                                    <Slider
                                        value={imageEffects.pixelate || 0}
                                        onChange={(_, value) => handleImageEffectChange('pixelate', value as number)}
                                        min={0}
                                        max={200}
                                        size="small"
                                        sx={{ color: '#3b82f6' }}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="caption" gutterBottom>
                                        Vibrance: {imageEffects.vibrance}
                                    </Typography>
                                    <Slider
                                        value={imageEffects.vibrance || 0}
                                        onChange={(_, value) => handleImageEffectChange('vibrance', value as number)}
                                        min={-100}
                                        max={100}
                                        size="small"
                                        sx={{ color: '#3b82f6' }}
                                    />
                                </Box>
                            </>
                        ) : (
                            <>
                                <Typography variant="subtitle2" fontWeight={600} color="#171717">
                                    Video Settings
                                </Typography>

                                <TextField
                                    label="Watermark Text"
                                    value={watermarkText}
                                    onChange={(e) => setWatermarkText(e.target.value)}
                                    placeholder="Enter watermark text"
                                    fullWidth
                                    size="small"
                                />

                                <Box>
                                    <Typography variant="caption" gutterBottom>
                                        Max Duration: {videoTransforms.duration || 0} seconds
                                    </Typography>
                                    <Slider
                                        value={videoTransforms.duration || 0}
                                        onChange={(_, value) =>
                                            setVideoTransforms((prev) => ({ ...prev, duration: value as number || undefined }))
                                        }
                                        min={0}
                                        max={60}
                                        size="small"
                                        sx={{ color: '#f97316' }}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="caption" gutterBottom>
                                        Start Offset: {videoTransforms.startOffset || 0} seconds
                                    </Typography>
                                    <Slider
                                        value={videoTransforms.startOffset || 0}
                                        onChange={(_, value) =>
                                            setVideoTransforms((prev) => ({ ...prev, startOffset: value as number || undefined }))
                                        }
                                        min={0}
                                        max={30}
                                        size="small"
                                        sx={{ color: '#3b82f6' }}
                                    />
                                </Box>
                            </>
                        )}
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>
                <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#f97316', '&:hover': { backgroundColor: '#ea580c' } }}>
                    Apply Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}
