import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Card, CardContent, CardHeader, TextField, Typography, Chip, Stack, Paper } from '@mui/material';
import { Sparkles, Send, Calendar, DollarSign, MapPin } from 'lucide-react';
import Navbar from '../general/Navbar';

interface Message { id: number; text: string; sender: 'user' | 'ai'; timestamp: Date; }
const aiMessages: string[] = [
  "Great! ✈️ Let's start planning — what's your approximate budget for this trip?",
  "And how long are you planning to travel for? ⏱️",
  "Awesome! 🌟 Based on your preferences, I'll create a personalized itinerary for you. Give me a moment to work my magic! 🪄"
];
export default function App() {
  const [numAiMessages, setNumAiMessages] = useState(0);
  const [messages, setMessages] = useState<Message[]>([{ id: 1, text: "Hi there! 👋 I'm your AI travel assistant. Tell me about your dream vacation and I'll create a personalized itinerary just for you. Where would you like to go?", sender: 'ai', timestamp: new Date() }]);
  const [inputMessage, setInputMessage] = useState(''); const [isTyping, setIsTyping] = useState(false); const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => { if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight; };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputMessage.trim(); if (!messageText) return;
    const userMessage: Message = { id: messages.length + 1, text: messageText, sender: 'user', timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]); setInputMessage(''); setIsTyping(true);
    setTimeout(() => { const aiMessage: Message = { id: messages.length + 2+numAiMessages, text: aiMessages[numAiMessages], sender: 'ai', timestamp: new Date() }; setMessages((prev) => [...prev, aiMessage]); setIsTyping(false);setNumAiMessages(numAiMessages+1); }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
  const handleQuickAction = (action: string) => { handleSendMessage(action); };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff',width: '100%' ,overflowX: 'hidden', margin:'auto 0'}}>
      {/* Hero Section */}
      <Navbar></Navbar>
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
            {/* Chat Area */}
            <Box ref={scrollAreaRef} sx={{ height: 500, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {messages.map((m) => (
                <Box key={m.id} sx={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <Paper sx={{ p: 2, borderRadius: 3, bgcolor: m.sender === 'user' ? '#ffa83fff' : '#fff7ed', color: m.sender === 'user' ? 'white' : 'black', border: m.sender === 'ai' ? '1px solid #ffe4cc' : 'none', maxWidth: '80%' }}>
                    {m.sender === 'ai' && <Stack direction="row" alignItems="center" spacing={1} mb={0.5}><Sparkles style={{ width: 14, height: 14, color: '#ff6b35' }} /><Typography variant="caption" sx={{ opacity: 0.7 }}>AI Assistant</Typography></Stack>}
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{m.text}</Typography>
                  </Paper>
                </Box>
              ))}
              {isTyping && <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}><Paper sx={{ bgcolor: '#fff7ed', border: '1px solid #ffe4cc', p: 2, borderRadius: 3 }}><Stack direction="row" spacing={0.5}>{[0,150,300].map((delay)=><Box key={delay} sx={{ width: 8, height: 8, bgcolor: '#ff6b35', borderRadius: '50%', animation: `bounce 1s infinite`, animationDelay: `${delay}ms` }} />)}</Stack></Paper></Box>}
            </Box>

            {/* Quick Actions */}
            <Box sx={{ px: 3, py: 2, borderTop: '1px solid #f5f5f5', bgcolor: '#fffaf5' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>Quick suggestions:</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                <Chip label="Beach vacation" icon={<MapPin size={14} />} variant="outlined" onClick={() => handleQuickAction('I want a relaxing beach vacation')} sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }} />
                <Chip label="Adventure trip" icon={<MapPin size={14} />} variant="outlined" onClick={() => handleQuickAction('I want an adventure trip with hiking and exploring')} sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }} />
                <Chip label="Cultural experience" icon={<MapPin size={14} />} variant="outlined" onClick={() => handleQuickAction('Cultural experience with local food tours')} sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }} />
                <Chip label="1 week" icon={<Calendar size={14} />} variant="outlined" onClick={() => handleQuickAction('1 week trip')} sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }} />
                <Chip label="Moderate budget" icon={<DollarSign size={14} />} variant="outlined" onClick={() => handleQuickAction('Moderate budget')} sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }} />
              </Stack>
            </Box>

            {/* Input */}
            <Box sx={{ p: 3, borderTop: '1px solid #f5f5f5' }}>
              <Stack direction="row" spacing={2}>
                <TextField fullWidth placeholder="Type your message..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} variant="outlined" size="small" />
                <Button variant="contained" onClick={() => handleSendMessage()} disabled={!inputMessage.trim() || isTyping} sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a25' } }}><Send size={18} /></Button>
              </Stack>
              <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1 }}>Press Enter to send • AI will generate your personalized itinerary</Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Features */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, mt: 6 }}>
          <FeatureCard icon={<Sparkles color="white" size={24} />} bg="#ff6b35" title="AI-Powered" text="Advanced AI creates personalized itineraries based on your preferences" />
          <FeatureCard icon={<MapPin color="white" size={24} />} bg="#000" title="Custom Routes" text="Get optimized routes and schedules tailored to your travel style" />
          <FeatureCard icon={<Calendar color="white" size={24} />} bg="#ff6b35" title="Flexible Planning" text="Plan trips of any duration with flexible itineraries that match your schedule" />
        </Box>
      </Box>
    </Box>
  );
}

function FeatureCard({ icon, title, text, bg }: { icon: React.ReactNode; title: string; text: string; bg: string }) {
  return (
    <Paper sx={{ textAlign: 'center', p: 4, borderRadius: 3, border: '1px solid #ffe4cc', bgcolor: '#fff7ed' }}>
      <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>{icon}</Box>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{text}</Typography>
    </Paper>
  );
}
