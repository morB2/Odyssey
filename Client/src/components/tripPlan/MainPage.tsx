import React, { useState, useRef, useEffect, useCallback, type FC } from 'react';
import { Box, Card, CardContent, CardHeader, Typography, Stack } from '@mui/material';
import { Sparkles, Calendar, MapPin } from 'lucide-react';
// IMPORT NEW COMPONENTS
import { ChatInput } from './ChatInput';
import { FeatureCard } from './FeatureCard';
import { type Message, type Itinerary } from './types';
import { getSuggestions, customizeTrip, findOptimalRoute } from '../../services/createTrip.service';
import { Navbar } from '../general/Navbar';
import { useTranslation } from 'react-i18next';
import { QuickActions } from './QuickActions';
import { ChatWindow } from './ChatWindow';


export const MainPage: FC = () => {
    // --- State Management (All kept here) ---
    const { t } = useTranslation();
    const [numAiMessages, setNumAiMessages] = useState(0);
    const [suggestions, setSuggestions] = useState<Itinerary[]>([]);
    const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
    const [travelMode, setTravelMode] = useState<string | null>(null);
    const [route, setRoute] = useState<any>(null); // Full route object from API
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement | null>(null);

    const initialMessage: Message = { id: 1, text: t("main_page.initial_message"), sender: 'ai', timestamp: new Date() };
    const [messages, setMessages] = useState<Message[]>([initialMessage]);

        const featureData = [
        { icon: <Sparkles color="white" size={24} />, bg: "#ff6b35", title: t("main_page.feature_ai_title"), text: t("main_page.feature_ai_text") },
        { icon: <MapPin color="white" size={24} />, bg: "#000", title: t("main_page.feature_routes_title"), text: t("main_page.feature_routes_text") },
        { icon: <Calendar color="white" size={24} />, bg: "#ff6b35", title: t("main_page.feature_flexible_title"), text: t("main_page.feature_flexible_text") },
    ];

    const scrollToBottom = () => { if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight; };
    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleSendMessage = useCallback(async (text?: string) => {
        const messageText = text || inputMessage.trim();
        if (!messageText || messageText.length > 2000 || messageText.length < 1) return;

        const userMessage: Message = { id: messages.length + 1, text: messageText, sender: 'user', timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            if (isCustomizing && selectedItinerary && travelMode) {
                const data = await customizeTrip({ prompt: messageText, trip: route });
                if (data.success) {
                    const aiUpdateConfirm: Message = { id: messages.length + 2, text: t("main_page.ai_customize_done"), sender: 'ai', timestamp: new Date() };
                    const aiUpdatedTrip: Message = { id: messages.length + 3, text: null, sender: 'ai', timestamp: new Date(), content: { type: 'tripDisplay', data: data } };
                    setMessages((prev) => [...prev, aiUpdateConfirm, aiUpdatedTrip]);
                    setRoute(data.route);
                } else {
                    throw new Error("Customization not found");
                }
            } else if (numAiMessages === 0) {
                const data = await getSuggestions(messageText);

                if (data.success && data.suggestions) {
                    setSuggestions(data.suggestions);

                    const aiMessage1: Message = { id: messages.length + 2, text: t("main_page.ai_suggestions_intro"), sender: 'ai', timestamp: new Date() };
                    const aiMessage2: Message = { id: messages.length + 3, text: null, sender: 'ai', timestamp: new Date(), content: { type: 'suggestions', data: data.suggestions } };
                    const aiMessage3: Message = { id: messages.length + 4, text: t("main_page.ai_suggestions_click"), sender: 'ai', timestamp: new Date() };

                    setMessages((prev) => [...prev, aiMessage1, aiMessage2, aiMessage3]);
                    setNumAiMessages(prev => prev + 1);
                } else {
                    throw new Error("Suggestions not found");
                }
            } else {
                setTimeout(() => {
                    const aiMessage: Message = { id: messages.length + 2 + numAiMessages,  text: t("main_page.ai_error_busy"), sender: 'ai', timestamp: new Date() };
                    setMessages((prev) => [...prev, aiMessage]);
                    setNumAiMessages(prev => prev + 1);
                }, 1500);
            }
        } catch (error: any) {
            console.error("Error:", error);
           
                const aiErrorMessage: Message = {
                    id: messages.length + 2,
                    text: t("main_page.ai_error_unavailable"),
                    sender: 'ai',
                    timestamp: new Date()
                };
                setMessages((prev) => [...prev, aiErrorMessage]);
        } finally {
            setIsTyping(false);
        }
    }, [inputMessage, messages.length, numAiMessages, isCustomizing, selectedItinerary, travelMode, route]);

    const handleSelectItinerary = useCallback((itinerary: Itinerary) => {
        if (selectedItinerary && travelMode) return;

        setSelectedItinerary(itinerary);

        const userMessage: Message = {
            id: messages.length + 1,
            text: t("main_page.user_selected_itinerary", { title: itinerary.title }),
            sender: 'user',
            timestamp: new Date()
        };

        const aiPrompt: Message = {
            id: messages.length + 2,
            text: t("main_page.ai_travel_question"),
            sender: 'ai',
            timestamp: new Date()
        };

        const aiTravelMode: Message = {
            id: messages.length + 3,
            text: null,
            sender: 'ai',
            timestamp: new Date(),
            content: {
                type: 'travelModeSelection',
                data: { selectedItineraryTitle: itinerary.title }
            }
        };

        setMessages((prev) => [...prev, userMessage, aiPrompt, aiTravelMode]);
    }, [selectedItinerary, travelMode, messages.length]);


    // 3. Select Travel Mode Handler
    const handleSelectTravelMode = useCallback(async (mode: string) => {
        setTravelMode(mode);

        const userMessage: Message = { id: messages.length + 1, text: t("main_page.user_selected_mode", { mode }), sender: 'user', timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        try {
            const data = await findOptimalRoute(selectedItinerary?.destinations || [], mode.toLowerCase());

if (data.success) {
                const aiConfirm: Message = {
                    id: messages.length + 2,
                    text: t("main_page.ai_route_confirm", {
                        mode: mode.toLowerCase(),
                        title: selectedItinerary?.title
                    }),
                    sender: 'ai',
                    timestamp: new Date()
                };

                const aiTripDisplay: Message = {
                    id: messages.length + 3,
                    text: null,
                    sender: 'ai',
                    timestamp: new Date(),
                    content: { type: 'tripDisplay', data: data }
                };

                const aiCustomize: Message = {
                    id: messages.length + 4,
                    text: t("main_page.ai_customize_prompt"),
                    sender: "ai",
                    timestamp: new Date()
                };

                setMessages((prev) => [...prev, aiConfirm, aiTripDisplay, aiCustomize]);
                setIsCustomizing(true);
                setRoute(data.route);
            } else {
                throw new Error("Route not found");
            }
        } catch (err: any) {
            console.error('Error fetching optimal route', err);
           
                const aiErrorMessage: Message = {
                    id: messages.length + 2,
                    text: t("main_page.ai_error_unavailable"),
                    sender: 'ai',
                    timestamp: new Date()
                };
                setMessages((prev) => [...prev, aiErrorMessage]);
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
                    <Typography variant="h3" align="center" sx={{ mt: 2, mb: 2, maxWidth: 700 }}> {t("main_page.hero_title")}</Typography>
                    <Typography align="center" sx={{ maxWidth: 600, opacity: 0.9 }}>{t("main_page.hero_subtitle")}</Typography>
                </Box>
            </Box>

            {/* Chat Section */}
            <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2, position: 'relative', zIndex: 1, pb: 6 }}>
                <Card sx={{ border: '2px solid #f5f5f5', boxShadow: 8 }}>
                    <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><Sparkles style={{ color: '#ff6b35', width: 20, height: 20 }} /><Typography variant="h6">{t("main_page.chat_header")}</Typography></Stack>} sx={{ background: 'linear-gradient(to right, #fff7ed, #ffffff)' }} />
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