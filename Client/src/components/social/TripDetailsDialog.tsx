import {
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    Divider,
    Box,
    Typography,
    IconButton,
    Button,
    Chip,
} from '@mui/material';
import { Close, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { type Dispatch, type SetStateAction, useCallback } from 'react';
import { type Trip } from './types';
import { isVideo } from '../../utils/mediaUtils';

interface TripDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    trip: Trip;
    dialogImageIndex: number;
    setDialogImageIndex: Dispatch<SetStateAction<number>>;
}

export default function TripDetailsDialog({
    open,
    onClose,
    trip,
    dialogImageIndex,
    setDialogImageIndex,
}: TripDetailsDialogProps) {
    const totalImages = trip.images?.length ?? 0;

    const nextDialogImage = useCallback(() => {
        setDialogImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
    }, [totalImages, setDialogImageIndex]);

    const prevDialogImage = useCallback(() => {
        setDialogImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
    }, [totalImages, setDialogImageIndex]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" fontWeight={600}>
                        {trip.title || trip.location}
                    </Typography>
                    <IconButton onClick={onClose} edge="end">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>
                    {/* Left Side - Media (Images & Videos) */}
                    <Grid size={{ xs: 12, md: 6 }} >
                        {trip.images && totalImages > 0 && (
                            <Box
                                position="relative"
                                sx={{ bgcolor: 'grey.200', borderRadius: 2, overflow: 'hidden' }}
                            >
                                {isVideo(trip.images[dialogImageIndex]) ? (
                                    <video
                                        src={trip.images[dialogImageIndex]}
                                        controls
                                        style={{
                                            width: '100%',
                                            height: '400px',
                                            objectFit: 'cover',
                                            display: 'block',
                                            backgroundColor: '#000',
                                        }}
                                        autoPlay
                                        muted
                                    />
                                ) : (
                                    <img
                                        src={trip.images[dialogImageIndex]}
                                        alt={`${trip.location} - ${dialogImageIndex + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '400px',
                                            objectFit: 'cover',
                                            display: 'block',
                                        }}
                                    />
                                )}

                                {totalImages > 1 && (
                                    <>
                                        <IconButton
                                            onClick={prevDialogImage}
                                            sx={{
                                                position: 'absolute',
                                                left: 8,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                                color: 'white',
                                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                                            }}
                                        >
                                            <ChevronLeft />
                                        </IconButton>
                                        <IconButton
                                            onClick={nextDialogImage}
                                            sx={{
                                                position: 'absolute',
                                                right: 8,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                                color: 'white',
                                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                                            }}
                                        >
                                            <ChevronRight />
                                        </IconButton>
                                        {/* Media Dots */}
                                        <Box
                                            position="absolute"
                                            bottom={12}
                                            left="50%"
                                            sx={{ transform: 'translateX(-50%)' }}
                                            display="flex"
                                            gap={0.75}
                                        >
                                            {trip.images.map((_, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        height: 6,
                                                        width: index === dialogImageIndex ? 24 : 6,
                                                        borderRadius: 3,
                                                        bgcolor:
                                                            index === dialogImageIndex
                                                                ? '#ff6b35'
                                                                : 'rgba(255, 255, 255, 0.6)',
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </>
                                )}
                            </Box>
                        )}
                    </Grid>

                    {/* Right Side - Trip Details */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box>
                            <Typography variant="body1" paragraph>
                                {trip.description}
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            {/* Optimized Route / Itinerary */}
                            {trip.optimizedRoute && (
                                <>
                                    <Typography variant="h6" gutterBottom fontWeight={600}>
                                        Itinerary
                                    </Typography>
                                    {trip.optimizedRoute.ordered_route?.map((stop: any, index: number) => (
                                        <Box key={index} sx={{ mb: 2, pl: 2, borderLeft: '3px solid #ff6b35' }}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {index + 1}. {stop.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {stop.note}
                                            </Typography>
                                        </Box>
                                    ))}

                                    <Divider sx={{ my: 2 }} />

                                    {/* Instructions */}
                                    {trip.optimizedRoute.instructions && (
                                        <>
                                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                                Directions
                                            </Typography>
                                            {trip.optimizedRoute.instructions.map((instruction: string, index: number) => (
                                                <Typography key={index} variant="body2" paragraph>
                                                    • {instruction}
                                                </Typography>
                                            ))}
                                            <Divider sx={{ my: 2 }} />
                                        </>
                                    )}
                                </>
                            )}

                            {/* Activities */}
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Activities
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                {trip.activities.map((activity: string, index: number) => (
                                    <Chip
                                        key={index}
                                        label={activity}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>

                            {/* Google Maps Link */}
                            {trip.optimizedRoute?.google_maps_url && (
                                <Button
                                    variant="contained"
                                    fullWidth
                                    href={trip.optimizedRoute.google_maps_url}
                                    target="_blank"
                                    sx={{ mt: 2 }}
                                >
                                    Open in Google Maps
                                </Button>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
}