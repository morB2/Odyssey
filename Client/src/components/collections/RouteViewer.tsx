import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Box, Typography, styled } from '@mui/material';
import { createPortal } from 'react-dom';
import type { Collection, Trip } from '../user/types';
import { useTranslation } from "react-i18next";
// 2. DEFINE THE EXTENDED TYPE
// This interface adds the timeline-specific 'offsetY' property to the shared Trip type.
interface TimelineTrip extends Trip {
  offsetY: number;
}

// ⚠️ IMPORTANT: Replace these with your actual component imports
import TripPost from '../social/TripPost';
import PathConnector from './PathConnector';
import RoutePreview from './RoutePreview';
import { adaptCommentsForUI } from '../../utils/tripAdapters';
import { useUserStore } from '../../store/userStore';
import { useCollectionsStore } from '../../store/collectionStore';
// --- Styled Components (Retained) ---

const RootContainer = styled(Box)(({ theme }) => ({
  //   minHeight: '100vh',
  background: 'white',
  position: 'relative',
  width: '100%',
  padding: theme.spacing(3, 4, 6),
}));

const ModalOverlay = styled(motion.div)(() => ({
  position: 'fixed',
  inset: 0,
  backdropFilter: 'blur(16px)',
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  zIndex: 9999,
  overflow: 'auto',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
}));

const CloseButton = styled(Box)({
  position: 'absolute',
  top: 16,
  right: 16,
  cursor: 'pointer',
  zIndex: 10000,
  color: '#ea580c',
});

const Marker = styled(Box)({
  width: 32,
  height: 32,
  backgroundColor: '#ea580c',
  borderRadius: '50%',
  border: '4px solid white',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
});

// --- Component Props ---

interface AppProps {
  collection: Collection;
  // Collection-level handlers for edit/delete on the preview
  onEdit?: (collection: Collection) => void;
  onDelete?: (collectionId: string) => void;
}

// --- Component ---

export default function RouteViewer({ collection,onEdit,onDelete }: AppProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();
  const storeUser = useUserStore((s) => s.user);

  // Define the offsets used for the visual layout
  // You would typically calculate this dynamically based on screen size or card content height
  const hardcodedOffsets = [30, -60, 30, -40, 10, -65, 50];

  // 3. MAP THE TRIPS TO ADD THE OFFSETY PROPERTY
  const timelineTrips: TimelineTrip[] = collection.trips.map((trip, index) => ({
    ...trip,
    // Add the timeline-specific property using the hardcoded offsets
    offsetY: hardcodedOffsets[index % hardcodedOffsets.length] || 0,
  }));
  //timelineTrips[timelineTrips.length - 1].offsetY = -80;
  // Use the enhanced array for all rendering logic
  const trips = timelineTrips;

  // If no trips, don't render the timeline logic
  if (!trips || trips.length === 0) {
    return (
      <RootContainer>
        <Typography variant="h5" color="textSecondary" sx={{ textAlign: 'center', pt: 4 }}>
          {t("collection.emptyCollection")}</Typography>
      </RootContainer>
    );
  }

  // Constants for desktop layout calculation
  // NOTE: Assuming TripPost's main image/carousel section is 200px tall
  const CARD_IMAGE_HEIGHT = 200;
  const CONNECTOR_WIDTH = 250;
  const TIMELINE_HEIGHT = 800;
  const MIDLINE_Y = 70;
  const MARKER_SIZE = 32;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use the first trip's image for the RoutePreview thumbnail
  const firstTripImage = trips[0].images.length > 0 ? trips[0].images[0] : '';

  // --- Modal Content ---
  const modalContent = (
    <ModalOverlay
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={() => setIsExpanded(false)}
    >

      <Box
        sx={{ width: '100vw' }}
      >
        {/* Mobile: Vertical Stack */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {trips.map((trip) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                <TripPost
                  trip={{
                    ...trip,
                    currentUserId: storeUser?._id || '',
                    comments: adaptCommentsForUI(trip.comments || [], t)
                  } as any}
                  showDescription={false}
                />
              </motion.div>
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
              <Marker />
            </Box>
          </Box>
        </Box>

        {/* Desktop: Horizontal Scroll (Timeline) */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ position: 'relative', overflowX: 'auto', overflowY: 'hidden', pb: 4, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                height: TIMELINE_HEIGHT,
                minWidth: 'max-content',
                px: 4,
              }}
            >
              {trips.map((trip, index) => {
                // Now TypeScript recognizes trip.offsetY
                const offsetY = trip.offsetY;
                const alignmentPointY = MIDLINE_Y + offsetY + CARD_IMAGE_HEIGHT / 2;

                // Safety check for the next trip
                const nextTrip = trips[index + 1];

                return (
                  <motion.div
                    key={trip._id}
                    style={{ display: 'flex', alignItems: 'flex-start' }}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15, duration: 0.4 }}
                  >

                    {/* START MARKER */}
                    {index === 0 && (
                      <Box sx={{ mr: 2, mt: `${alignmentPointY - MARKER_SIZE / 2}px` }}>
                        <Marker />
                      </Box>
                    )}

                    {/* TRIP POST CONTAINER */}
                    <Box
                      sx={{
                        flexShrink: 0,
                        // Position using the now-present trip.offsetY
                        mt: `${MIDLINE_Y + offsetY}px`,
                        width: 350, // Fixed width,
                        height: 500
                      }}
                    >
                      <TripPost
                        trip={{
                          ...trip,
                          currentUserId: storeUser?._id || '',
                          comments: adaptCommentsForUI(trip.comments || [], t)
                        } as any}
                        showDescription={false}
                      />
                    </Box>

                    {/* CURVED PATH CONNECTOR */}
                    {nextTrip && (
                      <Box sx={{ flexShrink: 0, position: 'relative', height: TIMELINE_HEIGHT, width: CONNECTOR_WIDTH }}>
                        <PathConnector
                          fromPosition={alignmentPointY + CARD_IMAGE_HEIGHT / 2}
                          // Safely access nextTrip.offsetY
                          toPosition={MIDLINE_Y + nextTrip.offsetY + CARD_IMAGE_HEIGHT}
                          width={CONNECTOR_WIDTH}
                        />
                      </Box>
                    )}

                    {/* END MARKER */}
                    {index === trips.length - 1 && (
                      <Box sx={{ ml: 2, mt: `${alignmentPointY - MARKER_SIZE / 2}px` }}>
                        <Marker />
                      </Box>
                    )}
                  </motion.div>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </ModalOverlay >
  );

  // --- Main Render ---
  return (
    <RootContainer>
      <RoutePreview
        title={collection.name}
        description={collection.description || ''}
        tripCount={trips.length}
        firstTripImage={firstTripImage}
        onClick={() => setIsExpanded(true)}
        onEdit={() => onEdit?.(collection)}
        onDelete={() => onDelete?.(String(collection._id))}
      />

      {mounted && createPortal(
        <AnimatePresence>
          {isExpanded && modalContent}
        </AnimatePresence>,
        document.body
      )}
    </RootContainer>
  );
}
