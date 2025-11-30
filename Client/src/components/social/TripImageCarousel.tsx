import { Box } from '@mui/material';
import type { Dispatch, SetStateAction } from 'react';
import { isVideo, getOptimizedFullSize } from '../../utils/mediaUtils';

interface TripImageCarouselProps {
    images: string[] | undefined; // Keep for backward compatibility
    currentImageIndex: number;
    setCurrentImageIndex: Dispatch<SetStateAction<number>>;
    title: string;
}

export default function TripImageCarousel({ images, currentImageIndex, setCurrentImageIndex, title }: TripImageCarouselProps) {
    if (!images || images.length === 0) return null;

    return (
        <Box position="relative" sx={{ bgcolor: 'grey.200' }}>
            {/* Media List (scrollable - images and videos) */}
            <Box sx={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
                {images.map((mediaUrl, index) => (
                    <Box
                        key={index}
                        sx={{
                            minWidth: '100%',
                            aspectRatio: '4/3',
                            scrollSnapAlign: 'start',
                        }}
                    >
                        {isVideo(mediaUrl) ? (
                            <video
                                src={getOptimizedFullSize(mediaUrl, 1200)}
                                controls
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block',
                                    backgroundColor: '#000',
                                }}
                            />
                        ) : (
                            <img
                                src={getOptimizedFullSize(mediaUrl, 1200)}
                                alt={`${title} - ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block',
                                }}
                            />
                        )}
                    </Box>
                ))}
            </Box>

            {/* Navigation Dots */}
            {images.length > 1 && (
                <Box
                    position="absolute"
                    bottom={12}
                    left="50%"
                    sx={{ transform: 'translateX(-50%)' }}
                    display="flex"
                    gap={0.75}
                >
                    {images.map((_, index) => (
                        <Box
                            key={index}
                            component="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(index);
                            }}
                            aria-label={`Go to image ${index + 1}`}
                            sx={{
                                height: 6,
                                width: index === currentImageIndex ? 24 : 6,
                                borderRadius: 3,
                                border: 'none',
                                bgcolor:
                                    index === currentImageIndex
                                        ? '#ff6b35'
                                        : 'rgba(255, 255, 255, 0.6)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    bgcolor:
                                        index === currentImageIndex
                                            ? '#ff6b35'
                                            : 'rgba(255, 255, 255, 0.8)',
                                },
                            }}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}