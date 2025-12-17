import React, { useState, useRef, useEffect } from 'react';
import Globe from 'react-globe.gl';
import type { GlobeMethods } from 'react-globe.gl';
import { Box, Typography, Card, Dialog, DialogContent, useTheme, CircularProgress } from '@mui/material';
import TripPost from '../social/TripPost';
import { type Trip } from '../social/types';
import { getTripById } from '../../services/tripPost.service';
import { useUserStore } from '../../store/userStore';
import { toast } from 'react-toastify';

export interface MapMarker {
    lat: number;
    lon: number;
    name: string;
    tripId: string;
    tripTitle: string;
    tripImage?: string | null;
    createdAt: string;
}

interface WorldMapProps {
    markers: MapMarker[];
}

export default function WorldMap({ markers }: WorldMapProps) {
    const globeEl = useRef<GlobeMethods | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const { user } = useUserStore();

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedTripData, setSelectedTripData] = useState<Trip | null>(null);
    const [loadingTrip, setLoadingTrip] = useState(false);
    const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 500 });

    const [hoveredMarker, setHoveredMarker] = useState<MapMarker | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const resize = () => {
            if (containerRef.current) {
                setContainerDimensions({
                    width: containerRef.current.offsetWidth,
                    height: 500
                });
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    useEffect(() => {
        if (globeEl.current) {
            const controls = globeEl.current.controls();
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;
        }
    }, []);

    const setRotationState = (shouldRotate: boolean) => {
        if (globeEl.current) {
            const controls = globeEl.current.controls();
            if (controls) {
                controls.autoRotate = shouldRotate;
            }
        }
    };

    const fetchTripData = async (tripId: string) => {
        try {
            setLoadingTrip(true);
            const data = await getTripById(tripId, user?._id);
            setSelectedTripData(data);
            setOpenDialog(true);
        } catch (error) {
            console.error('Error fetching trip:', error);
            toast.error('Failed to load trip details');
        } finally {
            setLoadingTrip(false);
        }
    };

    const handlePointClick = (marker: MapMarker) => {
        globeEl.current?.pointOfView({ lat: marker.lat, lng: marker.lon, altitude: 1.5 }, 1000);
        fetchTripData(marker.tripId);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (hoveredMarker) {
            setTooltipPosition({ x: e.clientX, y: e.clientY });
        }
    };

    return (
        <>
            <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 3, position: 'relative' }}>
                <div
                    ref={containerRef}
                    style={{ height: '500px', width: '100%' }}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setRotationState(false)}
                    onMouseLeave={() => setRotationState(true)}
                >
                    <Globe
                        ref={globeEl}
                        width={containerDimensions.width}
                        height={containerDimensions.height}
                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

                        pointsData={[]}

                        htmlElementsData={markers}
                        htmlLat={(d: any) => d.lat}
                        htmlLng={(d: any) => d.lon}
                        htmlAltitude={0}

                        htmlElement={(d: any) => {
                            const marker = d as MapMarker;
                            const el = document.createElement('div');
                            el.innerHTML = `
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="${theme.palette.primary.main}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                            `;

                            el.style.pointerEvents = 'auto';
                            el.style.cursor = 'pointer';

                            el.onclick = () => handlePointClick(marker);
                            el.onmouseenter = () => setHoveredMarker(marker);
                            el.onmouseleave = () => setHoveredMarker(null);

                            return el;
                        }}
                    />
                </div>

                {loadingTrip && (
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
                        <CircularProgress sx={{ color: theme.palette.primary.main }} />
                    </Box>
                )}
            </Card>

            {/* Tooltip */}
            {hoveredMarker && (
                <Box
                    sx={{
                        position: 'fixed',
                        left: tooltipPosition.x + 15,
                        top: tooltipPosition.y + 15,
                        zIndex: 9999,
                        pointerEvents: 'none',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 4,
                        p: 1.5,
                        maxWidth: 220,
                        animation: 'fadeIn 0.2s ease-in-out',
                        '@keyframes fadeIn': {
                            '0%': { opacity: 0 },
                            '100%': { opacity: 1 },
                        },
                    }}
                >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {hoveredMarker.tripTitle}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        {hoveredMarker.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1 }}>
                        {new Date(hoveredMarker.createdAt).toLocaleDateString()}
                    </Typography>
                    {hoveredMarker.tripImage && (
                        <Box
                            component="img"
                            src={hoveredMarker.tripImage}
                            alt={hoveredMarker.tripTitle}
                            sx={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 1 }}
                        />
                    )}
                    <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mt: 1, textAlign: 'center' }}>
                        Click to view details
                    </Typography>
                </Box>
            )}

            <Dialog
                open={openDialog}
                onClose={() => {
                    setOpenDialog(false);
                    setSelectedTripData(null);
                }}
                maxWidth="md"
                // fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogContent
                    sx={{
                        p: 0,
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                        '-ms-overflow-style': 'none',
                        'scrollbarWidth': 'none',
                    }}
                >
                    {selectedTripData && <TripPost trip={{...selectedTripData, currentUserId: user?._id || ''}} showDescription={true} />}
                </DialogContent>
            </Dialog>
        </>
    );
}