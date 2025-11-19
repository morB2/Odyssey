import React,  { type RefObject } from 'react';
import { Box ,Stack} from '@mui/material';
import MessageBubble from './MessageBubble';
import { type Message, type Itinerary } from './types';

interface ChatWindowProps {
    messages: Message[];
    isTyping: boolean;
    scrollAreaRef: RefObject<HTMLDivElement> | null;
    selectedItinerary: Itinerary | null;
    onSelectItinerary: (itinerary: Itinerary) => void;
    onSelectTravelMode: (mode: string) => void;
}

export default function ChatWindow({
    messages,
    isTyping,
    scrollAreaRef,
    selectedItinerary,
    onSelectItinerary,
    onSelectTravelMode,
}: ChatWindowProps) {
    return (
        <Box 
            ref={scrollAreaRef} 
            sx={{ 
                height: 500, 
                overflowY: 'auto', 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2 
            }}
        >
            {messages.map((m) => (
                <MessageBubble 
                    key={m.id} 
                    message={m} 
                    selectedItinerary={selectedItinerary}
                    onSelectItinerary={onSelectItinerary}
                    onSelectTravelMode={onSelectTravelMode}
                />
            ))}

            {isTyping && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Box sx={{ bgcolor: '#fff7ed', border: '1px solid #ffe4cc', p: 2, borderRadius: 3 }}>
                        <Stack direction="row" spacing={0.5}>
                            {[0, 150, 300].map((delay) => (
                                <Box 
                                    key={delay} 
                                    sx={{ 
                                        width: 8, 
                                        height: 8, 
                                        bgcolor: '#ff6b35', 
                                        borderRadius: '50%', 
                                        animation: `bounce 1s infinite`, 
                                        animationDelay: `${delay}ms` 
                                    }} 
                                />
                            ))}
                        </Stack>
                    </Box>
                </Box>
            )}
        </Box>
    );
}