import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Button, Card, CardContent, CardHeader, TextField, Typography, Chip, Stack, Paper } from '@mui/material';
import { Sparkles, Send, Calendar, DollarSign, MapPin } from 'lucide-react';
import Navbar from '../general/Navbar';
// IMPORT NEW COMPONENTS
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import QuickActions from './QuickActions';
import FeatureCard from './FeatureCard'; // Extracted
// Assuming types are in a separate file for cleanliness
import { type Message, type Itinerary } from './types';
import { getSuggestions, customizeTrip, findOptimalRoute } from '../../services/createTrip.service';

// --- Initial Data and Feature Card Data ---
const initialMessage: Message = { id: 1, text: "Hi there! 👋 I'm your AI travel assistant. Tell me about your dream vacation and I'll create a personalized itinerary just for you. Where would you like to go?", sender: 'ai', timestamp: new Date() };

const featureData = [
    { icon: <Sparkles color="white" size={24} />, bg: "#ff6b35", title: "AI-Powered", text: "Advanced AI creates personalized itineraries based on your preferences" },
    { icon: <MapPin color="white" size={24} />, bg: "#000", title: "Custom Routes", text: "Get optimized routes and schedules tailored to your travel style" },
    { icon: <Calendar color="white" size={24} />, bg: "#ff6b35", title: "Flexible Planning", text: "Plan trips of any duration with flexible itineraries that match your schedule" },
];


export default function MainPage() {
    // --- State Management (All kept here) ---
    const [numAiMessages, setNumAiMessages] = useState(0);
    const [suggestions, setSuggestions] = useState<Itinerary[]>([]);
    const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
    const [travelMode, setTravelMode] = useState<string | null>(null);
    const [route, setRoute] = useState<any>(null); // Full route object from API
    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => { if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight; };
    useEffect(() => { scrollToBottom(); }, [messages]);

    // --- API Handlers (All kept here) ---

    // 1. Send Message Handler (Handles initial prompt and customization)
    const handleSendMessage = useCallback(async (text?: string) => {
        // ... (API and validation logic from original component) ...
        // [Simplified for brevity]
        const messageText = text || inputMessage.trim();
        if (!messageText || messageText.length > 2000 || messageText.length < 1) return;

        const userMessage: Message = { id: messages.length + 1, text: messageText, sender: 'user', timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            if (isCustomizing && selectedItinerary && travelMode) {
                // --- CUSTOMIZATION LOGIC ---
                const data = await customizeTrip({ /* ... */ });

                if (data.success) {
                    const aiUpdateConfirm: Message = { id: messages.length + 2, text: "Got it! ✏️ I've updated your itinerary based on your feedback.", sender: 'ai', timestamp: new Date() };
                    const aiUpdatedTrip: Message = { id: messages.length + 3, text: null, sender: 'ai', timestamp: new Date(), content: { type: 'tripDisplay', data: data } };
                    setMessages((prev) => [...prev, aiUpdateConfirm, aiUpdatedTrip]);
                    setRoute(data.route);
                } else {
                    // Error handling for customization
                }
            } else if (numAiMessages === 0) {
                // --- INITIAL SUGGESTION LOGIC ---
                const data = await getSuggestions(messageText);

                if (data.success && data.suggestions) {
                    setSuggestions(data.suggestions);

                    const aiMessage1: Message = { id: messages.length + 2, text: "Here are some amazing itineraries I found for you 🌍", sender: 'ai', timestamp: new Date() };
                    const aiMessage2: Message = { id: messages.length + 3, text: null, sender: 'ai', timestamp: new Date(), content: { type: 'suggestions', data: data.suggestions } };
                    const aiMessage3: Message = { id: messages.length + 4, text: " Click on the itinerary that speaks to you, and I'll find you the best route! 🗺️", sender: 'ai', timestamp: new Date() };

                    setMessages((prev) => [...prev, aiMessage1, aiMessage2, aiMessage3]);
                    setNumAiMessages(prev => prev + 1);
                } else {
                    // Error handling for initial suggestions
                }
            } else {
                // --- FALLBACK LOGIC ---
                setTimeout(() => {
                    const aiMessage: Message = { id: messages.length + 2 + numAiMessages, text: "sorry,the server is too busy right now ... try again in a few minutes 😢", sender: 'ai', timestamp: new Date() };
                    setMessages((prev) => [...prev, aiMessage]);
                    setNumAiMessages(prev => prev + 1);
                }, 1500);
            }
        } catch (error) {
            console.error("Error:", error);
            // General error message for the user
        } finally {
            setIsTyping(false);
        }
    }, [inputMessage, messages.length, numAiMessages, isCustomizing, selectedItinerary, travelMode]);


    // 2. Select Itinerary Handler
    const handleSelectItinerary = useCallback((itinerary: Itinerary) => {
        if (selectedItinerary && travelMode) return;

        setSelectedItinerary(itinerary);

        const userMessage: Message = { id: messages.length + 1, text: `I choose: ${itinerary.title}`, sender: 'user', timestamp: new Date() };
        const aiPrompt: Message = { id: messages.length + 2, text: "Got it! 🚗 How would you like to travel?", sender: 'ai', timestamp: new Date() };
        const aiTravelMode: Message = { id: messages.length + 3, text: null, sender: 'ai', timestamp: new Date(), content: { type: 'travelModeSelection', data: { selectedItineraryTitle: itinerary.title } } };

        setMessages((prev) => [...prev, userMessage, aiPrompt, aiTravelMode]);
    }, [selectedItinerary, travelMode, messages.length]);


    // 3. Select Travel Mode Handler
    const handleSelectTravelMode = useCallback(async (mode: string) => {
        setTravelMode(mode);

        const userMessage: Message = { id: messages.length + 1, text: `I prefer ${mode.toLowerCase()}`, sender: 'user', timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        try {
            const data = await findOptimalRoute(selectedItinerary?.destinations || [], mode.toLowerCase());

            if (data.success) {
                const aiConfirm: Message = { id: messages.length + 2, text: `Perfect! 🌍 I’ll plan the best ${mode.toLowerCase()} route for your "${selectedItinerary?.title}" trip.`, sender: 'ai', timestamp: new Date() };
                const aiTripDisplay: Message = { id: messages.length + 3, text: null, sender: 'ai', timestamp: new Date(), content: { type: 'tripDisplay', data: data } };
                const aiCustomize: Message = { id: messages.length + 4, text: "If there’s anything you’d like me to change, just let me know and I’ll adjust it for you!", sender: "ai", timestamp: new Date() };

                setMessages((prev) => [...prev, aiConfirm, aiTripDisplay, aiCustomize]);
                setIsCustomizing(true);
                setRoute(data.route);
            } else {
                console.error('Error fetching optimal route');
            }
        } catch (err) {
            console.error('Error fetching optimal route', err);
        } finally {
            setIsTyping(false);
        }
    }, [selectedItinerary, messages.length]);

    const handleQuickAction = useCallback((action: string) => { handleSendMessage(action); }, [handleSendMessage]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fff', width: '100%', overflowX: 'hidden', margin: 'auto 0' }}>
            <Navbar />

            {/* Hero Section */}
            <Box sx={{ position: 'relative', height: 500, overflow: 'hidden', mb: -25 }}>
                <Box component="img" src="https://plus.unsplash.com/premium_photo-1681422570054-9ae5b8b03e46?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1332" alt="Travel destination" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.4), rgba(0,0,0,0.7))' }} />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', pb: 8, px: 2 }}>
                    <Sparkles style={{ width: 40, height: 40, color: '#ff6b35' }} />
                    <Typography variant="h3" align="center" sx={{ mt: 2, mb: 2, maxWidth: 700 }}>Create Your Dream Trip with AI</Typography>
                    <Typography align="center" sx={{ maxWidth: 600, opacity: 0.9 }}>Chat with our AI assistant to plan your perfect vacation</Typography>
                </Box>
            </Box>

            {/* Chat Section */}
            <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2, position: 'relative', zIndex: 1, pb: 6 }}>
                <Card sx={{ border: '2px solid #f5f5f5', boxShadow: 8 }}>
                    <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><Sparkles style={{ color: '#ff6b35', width: 20, height: 20 }} /><Typography variant="h6">AI Travel Assistant</Typography></Stack>} sx={{ background: 'linear-gradient(to right, #fff7ed, #ffffff)' }} />
                    <CardContent sx={{ p: 0 }}>

                        {/* Chat Area Component */}
                        <ChatWindow
                            messages={messages}
                            isTyping={isTyping}
                            scrollAreaRef={scrollAreaRef}
                            selectedItinerary={selectedItinerary}
                            onSelectItinerary={handleSelectItinerary}
                            onSelectTravelMode={handleSelectTravelMode}
                        />

                        {/* Quick Actions Component */}
                        <QuickActions onQuickAction={handleQuickAction} />

                        {/* Input Component */}
                        <ChatInput
                            inputMessage={inputMessage}
                            setInputMessage={setInputMessage}
                            handleSendMessage={handleSendMessage}
                            isTyping={isTyping}
                        />
                    </CardContent>
                </Card>

                {/* Features */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, mt: 6 }}>
                    {featureData.map((f, i) => <FeatureCard key={i} {...f} />)}
                </Box>
            </Box>
        </Box>
    );
}