// import { TripCard } from './TripCard';
// import { PathConnector } from './PathConnector';
// import { RoutePreview } from './RoutePreview';
// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion'; // Using framer-motion instead of motion/react for clarity
// import { X } from 'lucide-react';
// import { Box, Typography, styled } from '@mui/material';
// import { createPortal } from 'react-dom';

// // --- Data & Types ---

// interface Trip {
//   id: number;
//   title: string;
//   location: string;
//   date: string;
//   participants: number;
//   imageUrl: string;
//   offsetY: number; // Vertical offset in pixels
//   isFirst?: boolean;
// }

// const trips: Trip[] = [
//   {
//     id: 1,
//     title: 'Mountain Hiking in Eilat',
//     location: 'Eilat, Israel',
//     date: 'Jan 15-18, 2025',
//     participants: 12,
//     imageUrl: 'https://images.unsplash.com/photo-1603475429038-44361bcde123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWtpbmclMjB0cmFpbCUyMG1vdW50YWlufGVufDF8fHx8MTc2NTE4MTc3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     offsetY: 0
//   },
//   {
//     id: 2,
//     title: 'Beach Getaway',
//     location: 'Tel Aviv, Israel',
//     date: 'Jan 20-22, 2025',
//     participants: 8,
//     imageUrl: 'https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHRyYXZlbHxlbnwxfHx8fDE3NjUxODE3NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     offsetY: -60
//   },
//   {
//     id: 3,
//     title: 'Green Forest',
//     location: 'Northern Israel',
//     date: 'Jan 25-27, 2025',
//     participants: 15,
//     imageUrl: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjBuYXR1cmV8ZW58MXx8fHwxNzY1MTAwMzAzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     offsetY: 80
//   },
//   {
//     id: 4,
//     title: 'City Tour',
//     location: 'Jerusalem, Israel',
//     date: 'Feb 1-2, 2025',
//     participants: 20,
//     imageUrl: 'https://images.unsplash.com/photo-1520645521318-f03a712f0e67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwdHJhdmVsfGVufDF8fHx8MTc2NTEzNzMwNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     offsetY: -40
//   }
// ];

// // --- Styled Components for App ---

// const RootContainer = styled(Box)(({ theme }) => ({
//   minHeight: '100vh',
//   background: 'linear-gradient(to bottom, #fff7ed, white)',
//   position: 'relative',
//   width: '100%',
//   padding: theme.spacing(3, 4, 6),
// }));

// const ModalOverlay = styled(motion.div)(({ theme }) => ({
//   position: 'fixed',
//   inset: 0,
//   backdropFilter: 'blur(16px)',
//   backgroundColor: 'rgba(255, 255, 255, 0.3)',
//   zIndex: 9999,
//   overflow: 'auto',
//   scrollbarWidth: 'none',
//   '&::-webkit-scrollbar': { display: 'none' },
// }));

// const CloseButton = styled(Box)({
//   position: 'absolute',
//   top: 16,
//   right: 16,
//   cursor: 'pointer',
//   zIndex: 10000,
//   color: '#ea580c',
// });

// const Marker = styled(Box)({
//   width: 32,
//   height: 32,
//   backgroundColor: '#ea580c',
//   borderRadius: '50%',
//   border: '4px solid white',
//   boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
// });

// // --- Component ---

// export default function RouteViewer() {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   // Constants for desktop layout calculation
//   const CARD_IMAGE_HEIGHT = 176; // The height of the image portion (h-44)
//   const CONNECTOR_WIDTH =250;
//   const TIMELINE_HEIGHT = 600; // Total height of the scroll container
//   const MIDLINE_Y = TIMELINE_HEIGHT / 2;
//   const MARKER_SIZE = 32;

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   const modalContent = (
//     <ModalOverlay
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       exit={{ opacity: 0, scale: 0.95 }}
//       transition={{ duration: 0.4, ease: "easeOut" }}
//       onClick={() => setIsExpanded(false)}
//     >
//       <CloseButton onClick={() => setIsExpanded(false)}>
//         <X size={32} />
//       </CloseButton>
      
//       <Box 
//         sx={{ width: '100%', px: { xs: 2, md: 8 }, py: 6 }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <Typography 
//           variant="h4" 
//           component="h2"
//           sx={{ color: '#ea580c', mb: 4, fontWeight: 600, textAlign: 'center' }}
//         >
//           My Full Route
//         </Typography>

//         {/* Mobile: Vertical Stack */}
//         <Box sx={{ display: { xs: 'block', md: 'none' } }}>
//           <Box sx={{ maxWidth: 450, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
//             {trips.map((trip, index) => (
//               <motion.div
//                 key={trip.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.15, duration: 0.4 }}
//               >
//                 <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//                   <TripCard {...trip} isFirst={index === 0} />
//                   {index < trips.length - 1 && (
//                     <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
//                       <Box sx={{ width: 4, height: 48, background: 'linear-gradient(to bottom, #fb923c, #f97316)', borderRadius: '50px' }}></Box>
//                     </Box>
//                   )}
//                 </Box>
//               </motion.div>
//             ))}
//             <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
//               <Marker />
//             </Box>
//           </Box>
//         </Box>

//         {/* Desktop: Horizontal Scroll (FIXED Layout) */}
//         <Box sx={{ display: { xs: 'none', md: 'block' } }}>
//           <Box sx={{ position: 'relative', overflowX: 'auto', pb: 4, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
//             <Box 
//               sx={{ 
//                 display: 'flex', 
//                 alignItems: 'center', // Aligns cards to the midline based on their margin-top
//                 height: TIMELINE_HEIGHT, 
//                 minWidth: 'max-content',
//                 px: 4, // Horizontal padding
//               }}
//             >
//               {trips.map((trip, index) => {
//                 // The vertical point where the connector/marker should meet the card (center of the image)
//                 const alignmentPointY = MIDLINE_Y + trip.offsetY + CARD_IMAGE_HEIGHT / 2;
                
//                 return (
//                   <motion.div 
//                     key={trip.id} 
//                     style={{ display: 'flex', alignItems: 'flex-start' }}
//                     initial={{ opacity: 0, x: -50 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: index * 0.15, duration: 0.4 }}
//                   >
                    
//                     {/* START MARKER */}
//                     {index === 0 && (
//                       <Box sx={{ mr: 2, mt: `${alignmentPointY - MARKER_SIZE / 2}px` }}> 
//                         <Marker />
//                       </Box>
//                     )}
                    
//                     {/* TRIP CARD CONTAINER */}
//                     <Box 
//                       sx={{
//                         flexShrink: 0,
//                         // Position the card so its vertical center (MIDLINE_Y) is offset by trip.offsetY
//                         mt: `${MIDLINE_Y + trip.offsetY}px`,
//                         width: trip.isFirst ? 384 : 320,
//                       }}
//                     >
//                       <TripCard {...trip} isFirst={index === 0} />
//                     </Box>
                    
//                     {/* CURVED PATH CONNECTOR */}
//                     {index < trips.length - 1 && (
//                       <Box sx={{ flexShrink: 0, position: 'relative', height: TIMELINE_HEIGHT, width: CONNECTOR_WIDTH }}>
//                         <PathConnector
//                           // Connector starts at the alignment point of the current card
//                           fromPosition={alignmentPointY}
//                           // Connector ends at the alignment point of the next card
//                           toPosition={MIDLINE_Y + trips[index + 1].offsetY + CARD_IMAGE_HEIGHT / 2}
//                           width={CONNECTOR_WIDTH}
//                         />
//                       </Box>
//                     )}
                    
//                     {/* END MARKER */}
//                     {index === trips.length - 1 && (
//                       <Box sx={{ ml: 2, mt: `${alignmentPointY - MARKER_SIZE / 2}px` }}>
//                         <Marker />
//                       </Box>
//                     )}
//                   </motion.div>
//                 );
//               })}
//             </Box>
//           </Box>
//         </Box>
//       </Box>
//     </ModalOverlay>
//   );

//   return (
//     <RootContainer>
//       <Box sx={{ textAlign: 'center', mb: 6 }}>
//         <Typography variant="h3" sx={{ color: '#ea580c', mb: 1, fontWeight: 600 }}>
//           My Route
//         </Typography>
//         <Typography variant="body1" sx={{ color: '#4b5563' }}>
//           Your special collection of trips in one route
//         </Typography>
//       </Box>

//       <RoutePreview 
//         title="My Travel Route"
//         tripCount={trips.length}
//         firstTripImage={trips[0].imageUrl}
//         onClick={() => setIsExpanded(true)}
//       />

//       {mounted && createPortal(
//         <AnimatePresence>
//           {isExpanded && modalContent}
//         </AnimatePresence>,
//         document.body
//       )}
//     </RootContainer>
//   );
// }
// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { X } from 'lucide-react';
// import { Box, Typography, styled } from '@mui/material';
// import { createPortal } from 'react-dom';
// import type { Collection, Trip } from '../user/types';
// // ⚠️ REQUIRED TYPE DEFINITIONS ⚠️
// // Assuming these are imported from your shared types file:
// // import { Collection, Trip } from './types'; 


// // -----------------------------------------------------------------------

// // ⚠️ IMPORTANT: Replace these with your actual component imports
// import TripPostAdapter from '../user/TripPostAdapter'; 
// import { PathConnector } from './PathConnector'; 
// import { RoutePreview } from './RoutePreview';

// // ----------------------------------------------------------------

// // --- Styled Components (Retained) ---

// const RootContainer = styled(Box)(({ theme }) => ({
//   minHeight: '100vh',
//   background: 'linear-gradient(to bottom, #fff7ed, white)',
//   position: 'relative',
//   width: '100%',
//   padding: theme.spacing(3, 4, 6),
// }));

// const ModalOverlay = styled(motion.div)(() => ({
//   position: 'fixed',
//   inset: 0,
//   backdropFilter: 'blur(16px)',
//   backgroundColor: 'rgba(255, 255, 255, 0.3)',
//   zIndex: 9999,
//   overflow: 'auto',
//   scrollbarWidth: 'none',
//   '&::-webkit-scrollbar': { display: 'none' },
// }));

// const CloseButton = styled(Box)({
//   position: 'absolute',
//   top: 16,
//   right: 16,
//   cursor: 'pointer',
//   zIndex: 10000,
//   color: '#ea580c',
// });

// const Marker = styled(Box)({
//   width: 32,
//   height: 32,
//   backgroundColor: '#ea580c',
//   borderRadius: '50%',
//   border: '4px solid white',
//   boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
// });

// // --- Component Props ---

// interface AppProps {
//     collection: Collection; // <--- The component now expects a Collection prop
// }

// // --- Component ---

// export default function App({ collection }: AppProps) {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   // Use the trips from the collection
//   const trips = collection.trips;
  
//   // If no trips, don't render the timeline logic
//   if (!trips || trips.length === 0) {
//       return (
//           <RootContainer>
//               <Typography variant="h5" color="textSecondary" sx={{ textAlign: 'center', pt: 4 }}>
//                   This collection has no trips yet.
//               </Typography>
//           </RootContainer>
//       );
//   }

//   // Constants for desktop layout calculation
//   // NOTE: You MUST ensure TripPost's image height is 200px or update this constant.
//   const CARD_IMAGE_HEIGHT = 200; 
//   const CONNECTOR_WIDTH = 150;
//   const TIMELINE_HEIGHT = 800; 
//   const MIDLINE_Y = TIMELINE_HEIGHT / 2;
//   const MARKER_SIZE = 32;

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // Use the first trip's image for the RoutePreview thumbnail
//   const firstTripImage = trips[0].images.length > 0 ? trips[0].images[0] : '';
  
//   // --- Modal Content ---
//   const modalContent = (
//     <ModalOverlay
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       exit={{ opacity: 0, scale: 0.95 }}
//       transition={{ duration: 0.4, ease: "easeOut" }}
//       onClick={() => setIsExpanded(false)}
//     >
//       {/* ... (Modal Header and Close Button) ... */}
//       <CloseButton onClick={() => setIsExpanded(false)}>
//         <X size={32} />
//       </CloseButton>
      
//       <Box 
//         sx={{ width: '100%', px: { xs: 2, md: 8 }, py: 6 }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <Typography 
//           variant="h4" 
//           component="h2"
//           sx={{ color: '#ea580c', mb: 4, fontWeight: 600, textAlign: 'center' }}
//         >
//           {collection.name} Route
//         </Typography>

//         {/* Mobile: Vertical Stack */}
//         <Box sx={{ display: { xs: 'block', md: 'none' } }}>
//           <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
//             {trips.map((trip) => (
//               <motion.div
//                 key={trip._id}
//                 // ... animation props
//               >
//                 <TripPostAdapter trip={trip as any} onDelete={()=>{}}  onEdit={()=>{}}/> 
//               </motion.div>
//             ))}
//             <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
//               <Marker />
//             </Box>
//           </Box>
//         </Box>

//         {/* Desktop: Horizontal Scroll (Timeline) */}
//         <Box sx={{ display: { xs: 'none', md: 'block' } }}>
//           <Box sx={{ position: 'relative', overflowX: 'auto', pb: 4, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
//             <Box 
//               sx={{ 
//                 display: 'flex', 
//                 alignItems: 'center',
//                 height: TIMELINE_HEIGHT, 
//                 minWidth: 'max-content',
//                 px: 4,
//               }}
//             >
//               {trips.map((trip, index) => {
//                 // Ensure trip.offsetY exists (it came from your previous structure)
//                 const offsetY = trip.offsetY || 0; 
//                 const alignmentPointY = MIDLINE_Y + offsetY + CARD_IMAGE_HEIGHT / 2;
                
//                 // Safety check for the next trip
//                 const nextTrip = trips[index + 1];

//                 return (
//                   <motion.div 
//                     key={trip._id} 
//                     style={{ display: 'flex', alignItems: 'flex-start' }}
//                     // ... animation props
//                   >
                    
//                     {/* START MARKER */}
//                     {index === 0 && (
//                       <Box sx={{ mr: 2, mt: `${alignmentPointY - MARKER_SIZE / 2}px` }}> 
//                         <Marker />
//                       </Box>
//                     )}
                    
//                     {/* TRIP POST CONTAINER */}
//                     <Box 
//                       sx={{
//                         flexShrink: 0,
//                         mt: `${MIDLINE_Y + offsetY}px`,
//                         width: 600, // Fixed width
//                       }}
//                     >
//                       <TripPostAdapter trip={trip as any} onDelete={()=>{}}  onEdit={()=>{}}/> 
//                     </Box>
                    
//                     {/* CURVED PATH CONNECTOR */}
//                     {nextTrip && (
//                       <Box sx={{ flexShrink: 0, position: 'relative', height: TIMELINE_HEIGHT, width: CONNECTOR_WIDTH }}>
//                         <PathConnector
//                           fromPosition={alignmentPointY}
//                           toPosition={MIDLINE_Y + (nextTrip.offsetY || 0) + CARD_IMAGE_HEIGHT / 2}
//                           width={CONNECTOR_WIDTH}
//                         />
//                       </Box>
//                     )}
                    
//                     {/* END MARKER */}
//                     {index === trips.length - 1 && (
//                       <Box sx={{ ml: 2, mt: `${alignmentPointY - MARKER_SIZE / 2}px` }}>
//                         <Marker />
//                       </Box>
//                     )}
//                   </motion.div>
//                 );
//               })}
//             </Box>
//           </Box>
//         </Box>
//       </Box>
//     </ModalOverlay>
//   );
//   // --- Main Render ---
//   return (
//     <RootContainer>
//       <Box sx={{ textAlign: 'center', mb: 6 }}>
//         <Typography variant="h3" sx={{ color: '#ea580c', mb: 1, fontWeight: 600 }}>
//           {collection.name}
//         </Typography>
//         <Typography variant="body1" sx={{ color: '#4b5563' }}>
//           {collection.description || 'Your special collection of trips in one route'}
//         </Typography>
//       </Box>

//       <RoutePreview 
//         title={collection.name}
//         tripCount={trips.length}
//         firstTripImage={firstTripImage}
//         onClick={() => setIsExpanded(true)}
//       />

//       {mounted && createPortal(
//         <AnimatePresence>
//           {isExpanded && modalContent}
//         </AnimatePresence>,
//         document.body
//       )}
//     </RootContainer>
//   );
// }
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Box, Typography, styled } from '@mui/material';
import { createPortal } from 'react-dom';
// 1. Import the original types
import type { Collection, Trip } from '../user/types';

// 2. DEFINE THE EXTENDED TYPE
// This interface adds the timeline-specific 'offsetY' property to the shared Trip type.
interface TimelineTrip extends Trip {
    offsetY: number; 
}

// ⚠️ IMPORTANT: Replace these with your actual component imports
import TripPostAdapter from '../user/TripPostAdapter'; 
import { PathConnector } from './PathConnector'; 
import { RoutePreview } from './RoutePreview';

// --- Styled Components (Retained) ---

const RootContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(to bottom, #fff7ed, white)',
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
}

// --- Component ---

export default function App({ collection }: AppProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Define the offsets used for the visual layout
  // You would typically calculate this dynamically based on screen size or card content height
  const hardcodedOffsets = [0, -60, 80, -40, 20, -70, 50]; 

  // 3. MAP THE TRIPS TO ADD THE OFFSETY PROPERTY
  const timelineTrips: TimelineTrip[] = collection.trips.map((trip, index) => ({
    ...trip,
    // Add the timeline-specific property using the hardcoded offsets
    offsetY: hardcodedOffsets[index % hardcodedOffsets.length] || 0, 
  }));

  // Use the enhanced array for all rendering logic
  const trips = timelineTrips;
  
  // If no trips, don't render the timeline logic
  if (!trips || trips.length === 0) {
      return (
          <RootContainer>
              <Typography variant="h5" color="textSecondary" sx={{ textAlign: 'center', pt: 4 }}>
                  This collection has no trips yet.
              </Typography>
          </RootContainer>
      );
  }

  // Constants for desktop layout calculation
  // NOTE: Assuming TripPost's main image/carousel section is 200px tall
  const CARD_IMAGE_HEIGHT = 200; 
  const CONNECTOR_WIDTH = 150;
  const TIMELINE_HEIGHT = 800; 
  const MIDLINE_Y = TIMELINE_HEIGHT / 2;
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
      <CloseButton onClick={() => setIsExpanded(false)}>
        <X size={32} />
      </CloseButton>
      
      <Box 
        sx={{ width: '100%', px: { xs: 2, md: 8 }, py: 6 }}
        onClick={(e) => e.stopPropagation()}
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
                {/* Trip is passed to the adapter */}
                <TripPostAdapter trip={trip as any} onDelete={()=>{}} onEdit={()=>{}}/> 
              </motion.div>
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
              <Marker />
            </Box>
          </Box>
        </Box>

        {/* Desktop: Horizontal Scroll (Timeline) */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ position: 'relative', overflowX: 'auto', pb: 4, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
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
                        width: 300, // Fixed width,
                        height:500
                      }}
                    >
                      <TripPostAdapter trip={trip as any} onDelete={()=>{}} onEdit={()=>{}} /> 
                    </Box>
                    
                    {/* CURVED PATH CONNECTOR */}
                    {nextTrip && (
                      <Box sx={{ flexShrink: 0, position: 'relative', height: TIMELINE_HEIGHT, width: CONNECTOR_WIDTH }}>
                        <PathConnector
                          fromPosition={alignmentPointY}
                          // Safely access nextTrip.offsetY
                          toPosition={MIDLINE_Y + nextTrip.offsetY + CARD_IMAGE_HEIGHT / 2}
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
    </ModalOverlay>
  );
  
  // --- Main Render ---
  return (
    <RootContainer>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" sx={{ color: '#ea580c', mb: 1, fontWeight: 600 }}>
          {collection.name}
        </Typography>
        <Typography variant="body1" sx={{ color: '#4b5563' }}>
          {collection.description || 'Your special collection of trips in one route'}
        </Typography>
      </Box>

      <RoutePreview 
        title={collection.name}
        tripCount={trips.length}
        firstTripImage={firstTripImage}
        onClick={() => setIsExpanded(true)}
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