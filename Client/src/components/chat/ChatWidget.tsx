import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    TextField,
    Avatar,
    CircularProgress
} from '@mui/material';
import {
    Close as CloseIcon,
    Send as SendIcon,
    Minimize as MinimizeIcon
} from '@mui/icons-material';
import { useChat } from '../../context/ChatContext';
import { getConversation, sendMessage, markAsRead, type ChatMessage } from '../../services/chat.service';
import { useUserStore } from '../../store/userStore';
import { useSocketEvent } from '../../hooks/useSocket';
import { toast } from 'react-toastify';

export default function ChatWidget() {
    const { activeChatUser, isChatOpen, closeChat } = useChat();
    const { user: currentUser } = useUserStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMinimized, setIsMinimized] = useState(false);

    // Scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isChatOpen, isMinimized]);

    // Fetch conversation when chat opens or active user changes
    useEffect(() => {
        if (isChatOpen && activeChatUser && currentUser?._id) {
            const fetchMessages = async () => {
                setLoading(true);
                try {
                    const data = await getConversation(currentUser._id!, activeChatUser._id);
                    setMessages(data);
                    // Mark as read
                    await markAsRead(currentUser._id!, activeChatUser._id);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                    toast.error('Failed to load chat history');
                } finally {
                    setLoading(false);
                }
            };

            fetchMessages();
            setIsMinimized(false); // Auto-maximize on new chat
        }
    }, [isChatOpen, activeChatUser, currentUser]);

    // Listen for new messages
    useSocketEvent('newMessage', (message: ChatMessage) => {
        if (!currentUser?._id || !activeChatUser) return;

        // Only add if it belongs to the current conversation
        if (
            (message.senderId._id === activeChatUser._id && message.receiverId._id === currentUser._id) ||
            (message.senderId._id === currentUser._id && message.receiverId._id === activeChatUser._id)
        ) {
            setMessages((prev) => [...prev, message]);

            // If chat is open, mark as read immediately
            if (isChatOpen && !isMinimized) {
                markAsRead(currentUser._id!, activeChatUser._id).catch(console.error);
            }
        }
    });

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !currentUser?._id || !activeChatUser) return;

        const tempMessage: ChatMessage = {
            _id: Date.now().toString(), // Temp ID
            senderId: {
                _id: currentUser._id,
                firstName: currentUser.firstName || 'Me',
                lastName: '', // UserStore doesn't have lastName currently
                avatar: currentUser.avatar
            },
            receiverId: {
                _id: activeChatUser._id,
                firstName: activeChatUser.firstName,
                lastName: activeChatUser.lastName,
                avatar: activeChatUser.avatar
            },
            message: newMessage.trim(),
            read: false,
            createdAt: new Date().toISOString()
        };

        // Optimistic update
        setMessages((prev) => [...prev, tempMessage]);
        setNewMessage('');

        try {
            const sentMessage = await sendMessage(currentUser._id, activeChatUser._id, tempMessage.message);
            // Replace temp message with real one
            setMessages((prev) => prev.map(m => m._id === tempMessage._id ? sentMessage : m));
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
            // Remove failed message
            setMessages((prev) => prev.filter(m => m._id !== tempMessage._id));
        }
    };

    if (!isChatOpen || !activeChatUser) return null;

    if (isMinimized) {
        return (
            <Paper
                elevation={3}
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    width: 250,
                    zIndex: 1300,
                    cursor: 'pointer'
                }}
                onClick={() => setIsMinimized(false)}
            >
                <Box p={1.5} display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                            src={activeChatUser.avatar}
                            sx={{ width: 30, height: 30 }}
                        />
                        <Typography variant="subtitle2" noWrap>
                            {activeChatUser.firstName} {activeChatUser.lastName}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); closeChat(); }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper
            elevation={6}
            sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                width: 320,
                height: 450,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1300,
                overflow: 'hidden',
                borderRadius: 2
            }}
        >
            {/* Header */}
            <Box
                p={1.5}
                bgcolor="primary.main"
                color="primary.contrastText"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
            >
                <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                        src={activeChatUser.avatar}
                        sx={{ width: 32, height: 32, border: '2px solid white' }}
                    />
                    <Typography variant="subtitle1" fontWeight={600}>
                        {activeChatUser.firstName} {activeChatUser.lastName}
                    </Typography>
                </Box>
                <Box>
                    <IconButton size="small" onClick={() => setIsMinimized(true)} sx={{ color: 'inherit' }}>
                        <MinimizeIcon />
                    </IconButton>
                    <IconButton size="small" onClick={closeChat} sx={{ color: 'inherit' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Messages Area */}
            <Box
                flex={1}
                p={2}
                sx={{
                    overflowY: 'auto',
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                }}
            >
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress size={24} />
                    </Box>
                ) : messages.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%" color="text.secondary">
                        <Typography variant="body2">No messages yet. Say hi!</Typography>
                    </Box>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId._id === currentUser?._id;
                        return (
                            <Box
                                key={msg._id || index}
                                sx={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.5,
                                        bgcolor: isMe ? 'primary.main' : 'white',
                                        color: isMe ? 'white' : 'text.primary',
                                        borderRadius: 2,
                                        borderTopRightRadius: isMe ? 0 : 2,
                                        borderTopLeftRadius: isMe ? 2 : 0,
                                    }}
                                >
                                    <Typography variant="body2">{msg.message}</Typography>
                                </Paper>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        display: 'block',
                                        textAlign: isMe ? 'right' : 'left',
                                        mt: 0.5,
                                        fontSize: '0.7rem'
                                    }}
                                >
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            </Box>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box p={1.5} bgcolor="white" borderTop={1} borderColor="divider">
                <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 4,
                                bgcolor: '#f8f9fa'
                            }
                        }}
                    />
                    <IconButton
                        color="primary"
                        type="submit"
                        disabled={!newMessage.trim()}
                        sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.main' } }}
                    >
                        <SendIcon fontSize="small" />
                    </IconButton>
                </form>
            </Box>
        </Paper>
    );
}
