import { useState, useRef, useEffect } from 'react';
import Globe from 'react-globe.gl';
import type { GlobeMethods } from 'react-globe.gl';
import { Box, Card, Dialog, DialogContent, useTheme, CircularProgress } from '@mui/material';
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
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Set auto-rotate
    useEffect(() => {
        if (globeEl.current) {
            const controls = globeEl.current.controls();
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;
        }
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
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

    return (
        <>
            <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 3, position: 'relative' }}>
                <div
                    ref={containerRef}
                    style={{ height: '500px', width: '100%', direction: 'ltr' }}
                    onMouseEnter={() => setRotationState(false)}
                    onMouseLeave={() => setRotationState(true)}
                >
                    <Globe
                        ref={globeEl}
                        width={containerDimensions.width}
                        height={containerDimensions.height}
                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

                        htmlElementsData={markers}
                        htmlLat={(d: any) => d.lat}
                        htmlLng={(d: any) => d.lon}
                        htmlAltitude={0}

                        htmlElement={(d: any) => {
                            const marker = d as MapMarker;
                            const el = document.createElement('div');

                            // Container style
                            el.style.position = 'relative';
                            el.style.display = 'flex';
                            el.style.justifyContent = 'center';
                            el.style.alignItems = 'center';

                            const tooltipId = `tooltip-${marker.tripId}`;

                            el.innerHTML = `
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="${theme.palette.primary.main}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); cursor: pointer; transform: scale(1); transition: transform 0.2s;">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                                
                                <div id="${tooltipId}" style="
                                    position: absolute;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    background-color: ${theme.palette.background.paper};
                                    color: ${theme.palette.text.primary};
                                    padding: 12px;
                                    border-radius: 8px;
                                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                                    width: 220px;
                                    pointer-events: none;
                                    opacity: 0;
                                    visibility: hidden;
                                    transition: opacity 0.2s, visibility 0.2s;
                                    z-index: 1000;
                                    text-align: left;
                                ">
                                    <div style="font-weight: 600; margin-bottom: 4px; font-family: 'Roboto', sans-serif;">${marker.tripTitle.replace(/"/g, '&quot;')}</div>
                                    <div style="color: ${theme.palette.text.secondary}; font-size: 0.75rem; margin-bottom: 4px;">${marker.name.replace(/"/g, '&quot;')}</div>
                                    <div style="color: ${theme.palette.text.disabled}; font-size: 0.75rem; margin-bottom: 8px;">${new Date(marker.createdAt).toLocaleDateString()}</div>
                                    ${marker.tripImage ? `<img src="${marker.tripImage}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px; display: block;" />` : ''}
                                    <div style="color: ${theme.palette.primary.main}; font-size: 0.75rem; margin-top: 8px; text-align: center;">Click to view details</div>
                                    
                                    <!-- Arrow -->
                                    <div class="tooltip-arrow" style="
                                        position: absolute;
                                        left: 50%;
                                        margin-left: -6px;
                                        border-width: 6px;
                                        border-style: solid;
                                    "></div>
                                </div>
                            `;

                            el.style.pointerEvents = 'auto';
                            el.style.cursor = 'pointer';

                            // Event Listeners for Tooltip
                            const showTooltip = () => {
                                const tooltip = el.querySelector(`#${tooltipId}`) as HTMLElement;
                                const arrow = el.querySelector('.tooltip-arrow') as HTMLElement;
                                const icon = el.querySelector('svg') as SVGSVGElement;

                                if (tooltip && containerRef.current) {
                                    // Calculate position relative to container
                                    const rect = el.getBoundingClientRect();
                                    const containerRect = containerRef.current.getBoundingClientRect();
                                    const topSpace = rect.top - containerRect.top;

                                    // Default styles (Tooltip ABOVE)
                                    let bottom = '100%';
                                    let top = 'auto';
                                    let transform = 'translateX(-50%) translateY(-10px)';

                                    // Arrow styles (Pointing DOWN)
                                    let arrowTop = '100%';
                                    let arrowBottom = 'auto';
                                    let arrowBorderColor = `${theme.palette.background.paper} transparent transparent transparent`;

                                    // Check if too close to top (less than ~150px space)
                                    if (topSpace < 160) {
                                        // Position BELOW
                                        bottom = 'auto';
                                        top = '100%';
                                        transform = 'translateX(-50%) translateY(10px)';

                                        // Arrow pointing UP
                                        arrowTop = 'auto';
                                        arrowBottom = '100%';
                                        arrowBorderColor = `transparent transparent ${theme.palette.background.paper} transparent`;
                                    }

                                    // Apply styles
                                    tooltip.style.bottom = bottom;
                                    tooltip.style.top = top;
                                    tooltip.style.transform = transform;
                                    tooltip.style.visibility = 'visible';
                                    tooltip.style.opacity = '1';

                                    if (arrow) {
                                        arrow.style.top = arrowTop;
                                        arrow.style.bottom = arrowBottom;
                                        arrow.style.borderColor = arrowBorderColor;
                                    }
                                }

                                if (icon) {
                                    icon.style.transform = 'scale(1.2)';
                                }
                            };

                            const hideTooltip = () => {
                                const tooltip = el.querySelector(`#${tooltipId}`) as HTMLElement;
                                const icon = el.querySelector('svg') as SVGSVGElement;

                                if (tooltip) {
                                    tooltip.style.visibility = 'hidden';
                                    tooltip.style.opacity = '0';
                                }
                                if (icon) {
                                    icon.style.transform = 'scale(1)';
                                }
                            };

                            el.onclick = () => handlePointClick(marker);
                            el.onmouseenter = showTooltip;
                            el.onmouseleave = hideTooltip;

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

            <Dialog
                open={openDialog}
                onClose={() => {
                    setOpenDialog(false);
                    setSelectedTripData(null);
                }}
                maxWidth="md"
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
                    {selectedTripData && <TripPost trip={{ ...selectedTripData, currentUserId: user?._id || '' }} showDescription={true} />}
                </DialogContent>
            </Dialog>
        </>
    );
}