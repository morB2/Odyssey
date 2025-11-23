import React from 'react';
import { Box, Paper, Typography, Stack } from '@mui/material';
import { Sparkles } from 'lucide-react';
import { ItinerarySummary } from './ItinerarySummary'; // Imported from original file
import { TripDisplay } from './TripDisplay'; // Imported from original file
import { TravelModeSelector } from './TravelModeSelector'; // Extracted
import { type Message, type Itinerary } from './types';

interface MessageBubbleProps {
    message: Message;
    selectedItinerary: Itinerary | null;
    onSelectItinerary: (itinerary: Itinerary) => void;
    onSelectTravelMode: (mode: string) => void;
}

export default function MessageBubble({
    message: m,
    selectedItinerary,
    onSelectItinerary,
    onSelectTravelMode
}: MessageBubbleProps) {

    const isUser = m.sender === 'user';
    const isRichContent = !!m.content;

    // --- 2A: Render TEXT Messages ---
    if (m.text) {
        return (
            <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                <Paper
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: isUser ? '#ffa83fff' : '#fff7ed',
                        color: isUser ? 'white' : 'black',
                        border: isUser ? 'none' : '1px solid #ffe4cc',
                        maxWidth: '80%'
                    }}
                >
                    {!isUser && (
                        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                            <Sparkles style={{ width: 14, height: 14, color: '#ff6b35' }} />
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>AI Assistant</Typography>
                        </Stack>
                    )}
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{m.text}</Typography>
                </Paper>
            </Box>
        );
    }

    // --- 2B: Render RICH CONTENT Messages ---
    if (isRichContent) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%', ml: m.content?.type === 'travelModeSelection' ? 2 : 0 }}>
                {/* Rich Content: Itinerary Suggestions */}
                {m.content?.type === 'suggestions' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2, width: '100%' }}>
                        {m.content.data.map((s: Itinerary, index: number) => (
                            <Box
                                key={index}
                                onClick={() => onSelectItinerary(s)}
                                sx={{
                                    cursor: 'pointer',
                                    display: 'inline-block',
                                    width: 'fit-content',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        transition: '0.2s',
                                        boxShadow: 6
                                    },
                                    border: 'none',
                                    borderRadius: 2
                                }}
                            >
                                <ItinerarySummary
                                    title={s.title}
                                    discription={s.description}
                                    items={s.destinations.map((d: any) => ({ name: d.name, notes: d.note }))}
                                />
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Rich Content: Travel Mode Selection Buttons */}
                {m.content?.type === 'travelModeSelection' && (
                    <TravelModeSelector
                        onSelectMode={onSelectTravelMode}
                    />
                )}

                {/* Rich Content: Trip Display */}
                {m.content?.type === 'tripDisplay' && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                        <TripDisplay data={m.content.data} />
                    </Box>
                )}
            </Box>
        );
    }

    return null;
}