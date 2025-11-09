// import React, { useState, useRef, useEffect } from 'react';
// import { Box, Button, Card, CardContent, CardHeader, TextField, Typography, Chip, Stack, Paper } from '@mui/material';
// import { Sparkles, Send, Calendar, DollarSign, MapPin } from 'lucide-react';
// import Navbar from '../general/Navbar';
// import { ItinerarySummary } from './ItinerarySummary';

// interface Message { id: number; text: string; sender: 'user' | 'ai'; timestamp: Date; }
// export default function MainPage() {
//   const [numAiMessages, setNumAiMessages] = useState(0);
//   const [suggestions, setSuggestions] = useState<any[]>([]);
//   const [selectedItinerary, setSelectedItinerary] = useState<any | null>(null);
//   const [travelMode, setTravelMode] = useState<string | null>(null);
//   const [messages, setMessages] = useState<Message[]>([{ id: 1, text: "Hi there! 👋 I'm your AI travel assistant. Tell me about your dream vacation and I'll create a personalized itinerary just for you. Where would you like to go?", sender: 'ai', timestamp: new Date() }]);
//   const [inputMessage, setInputMessage] = useState(''); const [isTyping, setIsTyping] = useState(false); const scrollAreaRef = useRef<HTMLDivElement>(null);

//   const scrollToBottom = () => { if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight; };
//   useEffect(() => { scrollToBottom(); }, [messages]);

//   const handleSendMessage = async (text?: string) => {
//     const messageText = text || inputMessage.trim();
//     if (!messageText) return;

//     const userMessage: Message = {
//       id: messages.length + 1,
//       text: messageText,
//       sender: 'user',
//       timestamp: new Date()
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInputMessage('');
//     setIsTyping(true);

//     try {
//       // only call backend on first prompt (you can customize this condition)
//       if (numAiMessages === 0) {
//         const response = await fetch('http://localhost:3000/createTrip/suggestions', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ prompt: messageText }),
//         });
//         const data = await response.json();

//         if (data.success && data.suggestions) {
//           setSuggestions(data.suggestions);

//           const aiMessage: Message = {
//             id: messages.length + 2,
//             text: "Here are some amazing itineraries I found for you 🌍",
//             sender: 'ai',
//             timestamp: new Date(),
//           };
//           setMessages((prev) => [...prev, aiMessage]);
//           const aiMessage2: Message = {
//             id: messages.length + 2,
//             text: " Click on the itinerary that speaks to you, and I’ll find you the best route! 🗺️",
//             sender: 'ai',
//             timestamp: new Date(),
//           };
//           setMessages((prev) => [...prev, aiMessage2]);

//         }
//       } else {
//         // otherwise continue with your pre-defined ai messages
//         setTimeout(() => {
//           const aiMessage: Message = {
//             id: messages.length + 2 + numAiMessages,
//             text: "sorry,the server is to busy right now ... try again in a few minutes 😢",
//             sender: 'ai',
//             timestamp: new Date()
//           };
//           setMessages((prev) => [...prev, aiMessage]);
//           setIsTyping(false);
//           setNumAiMessages(numAiMessages + 1);
//         }, 1500);
//       }
//     } catch (error) {
//       console.error("Error fetching suggestions:", error);
//       setMessages((prev) => [...prev, {
//         id: messages.length + 2,
//         text: "Sorry, something went wrong fetching your itinerary 😢",
//         sender: 'ai',
//         timestamp: new Date()
//       }]);
//     } finally {
//       setIsTyping(false);
//     }
//   };
//   const handleSelectTravelMode = (mode: string) => {
//     setTravelMode(mode);

//     // Add user message
//     const userMessage: Message = {
//       id: messages.length + 1,
//       text: `I prefer ${mode.toLowerCase()}`,
//       sender: 'user',
//       timestamp: new Date(),
//     };
//     setMessages((prev) => [...prev, userMessage]);

//     // Add AI confirmation (you can later trigger a backend call here)
//     setTimeout(() => {
//       const aiMessage: Message = {
//         id: messages.length + 2,
//         text: `Perfect! 🌍 I’ll plan the best ${mode.toLowerCase()} route for your "${selectedItinerary.title}" trip.`,
//         sender: 'ai',
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, aiMessage]);
//     }, 800);
//   };

//   const handleSelectItinerary = (itinerary: any) => {
//     setSelectedItinerary(itinerary);

//     // Add a new user message ("I choose...")
//     const userMessage: Message = {
//       id: messages.length + 1,
//       text: `I choose: ${itinerary.title}`,
//       sender: 'user',
//       timestamp: new Date(),
//     };
//     setMessages((prev) => [...prev, userMessage]);
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
//   const handleQuickAction = (action: string) => { handleSendMessage(action); };

//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: '#fff', width: '100%', overflowX: 'hidden', margin: 'auto 0' }}>
//       {/* Hero Section */}
//       <Navbar></Navbar>
//       <Box sx={{ position: 'relative', height: 500, overflow: 'hidden', mb: -25 }}>
//         <Box component="img" src="https://plus.unsplash.com/premium_photo-1681422570054-9ae5b8b03e46?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1332" alt="Travel destination" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//         <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.4), rgba(0,0,0,0.7))' }} />
//         <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', pb: 8, px: 2 }}>
//           <Sparkles style={{ width: 40, height: 40, color: '#ff6b35' }} />
//           <Typography variant="h3" align="center" sx={{ mt: 2, mb: 2, maxWidth: 700 }}>Create Your Dream Trip with AI</Typography>
//           <Typography align="center" sx={{ maxWidth: 600, opacity: 0.9 }}>Chat with our AI assistant to plan your perfect vacation</Typography>
//         </Box>
//       </Box>

//       {/* Chat Section */}
//       <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2, position: 'relative', zIndex: 1, pb: 6 }}>
//         <Card sx={{ border: '2px solid #f5f5f5', boxShadow: 8 }}>
//           <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><Sparkles style={{ color: '#ff6b35', width: 20, height: 20 }} /><Typography variant="h6">AI Travel Assistant</Typography></Stack>} sx={{ background: 'linear-gradient(to right, #fff7ed, #ffffff)' }} />
//           <CardContent sx={{ p: 0 }}>
//             {/* Chat Area */}
//             <Box ref={scrollAreaRef} sx={{ height: 500, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
//               {messages.map((m) => (
//                 <React.Fragment key={m.id}>
//                   <Box sx={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
//                     <Paper sx={{ p: 2, borderRadius: 3, bgcolor: m.sender === 'user' ? '#ffa83fff' : '#fff7ed', color: m.sender === 'user' ? 'white' : 'black', border: m.sender === 'ai' ? '1px solid #ffe4cc' : 'none', maxWidth: '80%' }}>
//                       {m.sender === 'ai' && (
//                         <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
//                           <Sparkles style={{ width: 14, height: 14, color: '#ff6b35' }} />
//                           <Typography variant="caption" sx={{ opacity: 0.7 }}>AI Assistant</Typography>
//                         </Stack>
//                       )}
//                       <Typography sx={{ whiteSpace: 'pre-wrap' }}>{m.text}</Typography>
//                     </Paper>
//                   </Box>

//                   {/* Inline suggestions right after the relevant AI message */}
//                   {m.text.includes("Here are some amazing itineraries") && suggestions.length > 0 && (
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
//                       {suggestions.map((s, index) => (
//                         <Box
//                           key={index}
//                           onClick={() => handleSelectItinerary(s)}
//                           sx={{ cursor: 'pointer', '&:hover': { transform: 'scale(1.02)', transition: '0.2s' } }}
//                         >
//                           <ItinerarySummary
//                             title={s.title}
//                             discription={s.description}
//                             items={s.destinations.map((d: any) => ({
//                               name: d.name,
//                               notes: d.note
//                             }))}
//                           />
//                         </Box>
//                       ))}
//                     </Box>
//                   )}
//                 </React.Fragment>
//               ))}

//               {isTyping && <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}><Paper sx={{ bgcolor: '#fff7ed', border: '1px solid #ffe4cc', p: 2, borderRadius: 3 }}><Stack direction="row" spacing={0.5}>{[0, 150, 300].map((delay) => <Box key={delay} sx={{ width: 8, height: 8, bgcolor: '#ff6b35', borderRadius: '50%', animation: `bounce 1s infinite`, animationDelay: `${delay}ms` }} />)}</Stack></Paper></Box>}
//             </Box>
//             {/* Travel mode selection after itinerary choice */}
//             {selectedItinerary && !travelMode && (
//               <Box sx={{ display: 'flex', justifyContent: 'flex-start', ml: 2 }}>
//                 <Paper
//                   sx={{
//                     bgcolor: '#fff7ed',
//                     border: '1px solid #ffe4cc',
//                     p: 2,
//                     borderRadius: 3,
//                     maxWidth: '80%',
//                   }}
//                 >
//                   <Stack direction="column" spacing={1}>
//                     <Stack direction="row" alignItems="center" spacing={1}>
//                       <Sparkles style={{ width: 14, height: 14, color: '#ff6b35' }} />
//                       <Typography variant="caption" sx={{ opacity: 0.7 }}>
//                         AI Assistant
//                       </Typography>
//                     </Stack>

//                     <Typography sx={{ mb: 1 }}>
//                       Got it! 🚗 How would you like to travel?
//                     </Typography>

//                     <Stack direction="row" flexWrap="wrap" gap={1.5}>
//                       {['Driving 🚗', 'Walking 🚶‍♀️', 'Public Transport 🚌'].map((mode) => (
//                         <Button
//                           key={mode}
//                           onClick={() => handleSelectTravelMode(mode)}
//                           sx={{
//                             borderRadius: '9999px', border: '1px solid #ffccaa', color: '#ff6b35', backgroundColor: 'white', textTransform: 'none', px: 2.5,
//                             py: 0.8,
//                             fontWeight: 500,
//                             boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
//                             '&:hover': {
//                               backgroundColor: '#fff2e6',
//                               transform: 'scale(1.03)',
//                               transition: '0.15s ease-in-out',
//                             },
//                           }}
//                           variant="outlined"
//                         >
//                           {mode}
//                         </Button>
//                       ))}
//                     </Stack>
//                   </Stack>
//                 </Paper>
//               </Box>
//             )}


//             {/* Quick Actions */}
//             <Box sx={{ px: 3, py: 2, borderTop: '1px solid #f5f5f5', bgcolor: '#fffaf5' }}>
//               <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>Quick suggestions:</Typography>
//               <Stack direction="row" flexWrap="wrap" gap={1}>
//                 <Chip label="Beach vacation" icon={<MapPin size={14} />} variant="outlined" onClick={() => handleQuickAction('I want a relaxing beach vacation')} sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }} />
//                 <Chip label="Adventure trip" icon={<MapPin size={14} />} variant="outlined" onClick={() => handleQuickAction('I want an adventure trip with hiking and exploring')} sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }} />
//                 <Chip label="Cultural experience" icon={<MapPin size={14} />} variant="outlined" onClick={() => handleQuickAction('Cultural experience with local food tours')} sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }} />
//                 <Chip label="1 week" icon={<Calendar size={14} />} variant="outlined" onClick={() => handleQuickAction('1 week trip')} sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }} />
//                 <Chip label="Moderate budget" icon={<DollarSign size={14} />} variant="outlined" onClick={() => handleQuickAction('Moderate budget')} sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }} />
//               </Stack>
//             </Box>

//             {/* Input */}
//             <Box sx={{ p: 3, borderTop: '1px solid #f5f5f5' }}>
//               <Stack direction="row" spacing={2}>
//                 <TextField fullWidth placeholder="Type your message..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} variant="outlined" size="small" />
//                 <Button variant="contained" onClick={() => handleSendMessage()} disabled={!inputMessage.trim() || isTyping} sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a25' } }}><Send size={18} /></Button>
//               </Stack>
//               <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1 }}>Press Enter to send • AI will generate your personalized itinerary</Typography>
//             </Box>
//           </CardContent>
//         </Card>

//         {/* Features */}
//         <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, mt: 6 }}>
//           <FeatureCard icon={<Sparkles color="white" size={24} />} bg="#ff6b35" title="AI-Powered" text="Advanced AI creates personalized itineraries based on your preferences" />
//           <FeatureCard icon={<MapPin color="white" size={24} />} bg="#000" title="Custom Routes" text="Get optimized routes and schedules tailored to your travel style" />
//           <FeatureCard icon={<Calendar color="white" size={24} />} bg="#ff6b35" title="Flexible Planning" text="Plan trips of any duration with flexible itineraries that match your schedule" />
//         </Box>
//       </Box>
//     </Box>
//   );
// }

// function FeatureCard({ icon, title, text, bg }: { icon: React.ReactNode; title: string; text: string; bg: string }) {
//   return (
//     <Paper sx={{ textAlign: 'center', p: 4, borderRadius: 3, border: '1px solid #ffe4cc', bgcolor: '#fff7ed' }}>
//       <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>{icon}</Box>
//       <Typography variant="h6" gutterBottom>{title}</Typography>
//       <Typography variant="body2" color="text.secondary">{text}</Typography>
//     </Paper>
//   );
// }
import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Card, CardContent, CardHeader, TextField, Typography, Chip, Stack, Paper } from '@mui/material';
import { Sparkles, Send, Calendar, DollarSign, MapPin } from 'lucide-react';
import Navbar from '../general/Navbar';
import { ItinerarySummary } from './ItinerarySummary'; // Assuming this component is defined elsewhere

// --- 1. NEW TYPES FOR RICH CONTENT ---
interface RichContent {
  type: 'suggestions' | 'travelModeSelection'; // Identifiers for custom components
  data: any; // The data needed by the component
}

interface Message {
  id: number;
  text: string | null; // Text is now optional
  sender: 'user' | 'ai';
  timestamp: Date;
  content?: RichContent; // New field for rich content
}

// --- Travel Mode Selector Component (Extracted for cleanliness) ---
function TravelModeSelector({ onSelectMode }: { onSelectMode: (mode: string) => void }) {
  return (
    <Paper
      sx={{
        bgcolor: '#fff7ed',
        border: '1px solid #ffe4cc',
        p: 2,
        borderRadius: 3,
        maxWidth: '80%',
      }}
    >
      <Stack direction="row" flexWrap="wrap" gap={1.5}>
        {['Driving 🚗', 'Walking 🚶‍♀️', 'Public Transport 🚌'].map((mode) => (
          <Button
            key={mode}
            onClick={() => onSelectMode(mode.split(' ')[0])} // Pass back 'Driving', 'Walking', etc.
            sx={{
              borderRadius: '9999px', border: '1px solid #ffccaa', color: '#ff6b35', backgroundColor: 'white', textTransform: 'none', px: 2.5,
              py: 0.8, fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              '&:hover': {
                backgroundColor: '#fff2e6', transform: 'scale(1.03)', transition: '0.15s ease-in-out',
              },
            }}
            variant="outlined"
          >
            {mode}
          </Button>
        ))}
      </Stack>
    </Paper>
  );
}

// --- Feature Card (Kept from original) ---
function FeatureCard({ icon, title, text, bg }: { icon: React.ReactNode; title: string; text: string; bg: string }) {
  return (
    <Paper sx={{ textAlign: 'center', p: 4, borderRadius: 3, border: '1px solid #ffe4cc', bgcolor: '#fff7ed' }}>
      <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>{icon}</Box>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{text}</Typography>
    </Paper>
  );
}


export default function MainPage() {
  const [numAiMessages, setNumAiMessages] = useState(0);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<any | null>(null);
  const [travelMode, setTravelMode] = useState<string | null>(null);
  
  const initialMessage: Message = { id: 1, text: "Hi there! 👋 I'm your AI travel assistant. Tell me about your dream vacation and I'll create a personalized itinerary just for you. Where would you like to go?", sender: 'ai', timestamp: new Date() };
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  
  const [inputMessage, setInputMessage] = useState(''); 
  const [isTyping, setIsTyping] = useState(false); 
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => { if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight; };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputMessage.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      if (numAiMessages === 0) {
        const response = await fetch('http://localhost:3000/createTrip/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: messageText }),
        });
        const data = await response.json();

        if (data.success && data.suggestions) {
          setSuggestions(data.suggestions);

          const aiMessage1: Message = {
            id: messages.length + 2,
            text: "Here are some amazing itineraries I found for you 🌍",
            sender: 'ai',
            timestamp: new Date(),
          };
          
          // RICH CONTENT MESSAGE for Suggestions
          const aiMessage2: Message = {
            id: messages.length + 3,
            text: null, // No text here
            sender: 'ai',
            timestamp: new Date(),
            content: {
                type: 'suggestions',
                data: data.suggestions,
            }
          };
          
          const aiMessage3: Message = {
            id: messages.length + 4,
            text: " Click on the itinerary that speaks to you, and I’ll find you the best route! 🗺️",
            sender: 'ai',
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, aiMessage1, aiMessage2, aiMessage3]);
          setNumAiMessages(numAiMessages + 1); // Increment count after successful initial response
        }
      } else {
        // Fallback for subsequent prompts
        setTimeout(() => {
          const aiMessage: Message = {
            id: messages.length + 2 + numAiMessages,
            text: "sorry,the server is too busy right now ... try again in a few minutes 😢",
            sender: 'ai',
            timestamp: new Date()
          };
          setMessages((prev) => [...prev, aiMessage]);
          setIsTyping(false);
          setNumAiMessages(numAiMessages + 1);
        }, 1500);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setMessages((prev) => [...prev, {
        id: messages.length + 2,
        text: "Sorry, something went wrong fetching your itinerary 😢",
        sender: 'ai',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleSelectItinerary = (itinerary: any) => {
    // Only proceed if travel mode hasn't been selected yet for this trip
    if (selectedItinerary && travelMode) return; 

    setSelectedItinerary(itinerary);

    // 1. Add user message ("I choose...")
    const userMessage: Message = {
      id: messages.length + 1,
      text: `I choose: ${itinerary.title}`,
      sender: 'user',
      timestamp: new Date(),
    };
    
    // 2. Add AI prompt message (Text)
    const aiPrompt: Message = {
        id: messages.length + 2,
        text: "Got it! 🚗 How would you like to travel?",
        sender: 'ai',
        timestamp: new Date(),
    };

    // 3. Add AI rich content message: Travel Mode Selector
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
  };

  const handleSelectTravelMode = (mode: string) => {
    setTravelMode(mode);

    // 1. Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: `I prefer ${mode.toLowerCase()}`,
      sender: 'user',
      timestamp: new Date(),
    };
    
    // 2. Add AI confirmation
    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        text: `Perfect! 🌍 I’ll plan the best ${mode.toLowerCase()} route for your "${selectedItinerary?.title}" trip.`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
  const handleQuickAction = (action: string) => { handleSendMessage(action); };

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
            {/* Chat Area */}
            <Box ref={scrollAreaRef} sx={{ height: 500, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {messages.map((m) => (
                <React.Fragment key={m.id}>
                  
                  {/* --- 2A: Render TEXT Messages --- */}
                  {m.text && (
                      <Box sx={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: m.sender === 'user' ? '#ffa83fff' : '#fff7ed', color: m.sender === 'user' ? 'white' : 'black', border: m.sender === 'ai' ? '1px solid #ffe4cc' : 'none', maxWidth: '80%' }}>
                          {m.sender === 'ai' && (
                            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                              <Sparkles style={{ width: 14, height: 14, color: '#ff6b35' }} />
                              <Typography variant="caption" sx={{ opacity: 0.7 }}>AI Assistant</Typography>
                            </Stack>
                          )}
                          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{m.text}</Typography>
                        </Paper>
                      </Box>
                  )}

                  {/* --- 2B: Render RICH CONTENT Messages (Itinerary Cards, Buttons, etc.) --- */}
                  {m.content && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%', ml: m.content.type === 'travelModeSelection' ? 2 : 0 }}>
                      
                      {/* Rich Content: Itinerary Suggestions */}
                      {m.content.type === 'suggestions' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2, width: '100%' }}>
                          {m.content.data.map((s: any, index: number) => (
                            <Box
                              key={index}
                              onClick={() => handleSelectItinerary(s)}
                              sx={{ 
                                cursor: 'pointer', 
                                '&:hover': { 
                                  transform: 'scale(1.02)', 
                                  transition: '0.2s', 
                                  boxShadow: 6 
                                },
                                // Highlight selected itinerary
                                border: selectedItinerary?.title === s.title ? '2px solid #ff6b35' : '1px solid #ffe4cc',
                                borderRadius: 2
                              }}
                            >
                              <ItinerarySummary
                                title={s.title}
                                discription={s.description}
                                items={s.destinations.map((d: any) => ({
                                  name: d.name,
                                  notes: d.note
                                }))}
                              />
                            </Box>
                          ))}
                        </Box>
                      )}

                      {/* Rich Content: Travel Mode Selection Buttons */}
                      {m.content.type === 'travelModeSelection' && (
                        <TravelModeSelector 
                          onSelectMode={handleSelectTravelMode} 
                        />
                      )}
                    </Box>
                  )}
                </React.Fragment>
              ))}

              {isTyping && <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}><Paper sx={{ bgcolor: '#fff7ed', border: '1px solid #ffe4cc', p: 2, borderRadius: 3 }}><Stack direction="row" spacing={0.5}>{[0, 150, 300].map((delay) => <Box key={delay} sx={{ width: 8, height: 8, bgcolor: '#ff6b35', borderRadius: '50%', animation: `bounce 1s infinite`, animationDelay: `${delay}ms` }} />)}</Stack></Paper></Box>}
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