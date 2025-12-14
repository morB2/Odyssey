import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    TextField,
    Avatar,
    CircularProgress,
    Button,
    Stack
} from '@mui/material';
import {
    Send as SendIcon,
    Block as BlockIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import chatService, { type ChatMessage } from '../../services/chat.service';
import { useUserStore } from '../../store/userStore';
import { useSocketEvent } from '../../hooks/useSocket';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface ChatWindowProps {
    activeChatUser: any;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ activeChatUser }) => {
    const { t } = useTranslation();
    const { user: currentUser } = useUserStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [conversationStatus, setConversationStatus] = useState<any>(null);

    // Scroll to bottom of chat
    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch conversation when active user changes
    useEffect(() => {
        if (activeChatUser && currentUser?._id) {
            const fetchMessages = async () => {
                setLoading(true);
                try {
                    const data = await chatService.getConversation(activeChatUser._id); // ✅ Removed currentUserId
                    setMessages(data.messages || data); // Handle both array and object response
                    if (data.conversation) {
                        setConversationStatus(data.conversation);
                    } else {
                        setConversationStatus(null);
                    }

                    // Mark as read
                    await chatService.markAsRead(activeChatUser._id); // ✅ Removed currentUserId
                } catch (error) {
                    console.error('Error fetching messages:', error);
                    toast.error(t('chat.failedToLoadChat'));
                } finally {
                    setLoading(false);
                }
            };

            fetchMessages();
        }
    }, [activeChatUser, currentUser, t]);

    // Listen for new messages
    useSocketEvent('newMessage', (message: ChatMessage) => {
        console.log('New message received:', message);
        if (!currentUser?._id || !activeChatUser) return;

        // Only add if it belongs to the current conversation
        if (
            (message.senderId._id === activeChatUser._id && message.receiverId._id === currentUser._id) ||
            (message.senderId._id === currentUser._id && message.receiverId._id === activeChatUser._id)
        ) {
            setMessages((prev) => [...prev, message]);

            // Mark as read immediately since window is open
            chatService.markAsRead(activeChatUser._id).catch(console.error); // ✅ Removed currentUserId
        }
    });

    // Listen for conversation updates
    useSocketEvent('conversationUpdate', (conversation: any) => {
        if (activeChatUser && conversation.participants.includes(activeChatUser._id)) {
            setConversationStatus(conversation);
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
                lastName: '',
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
            const sentMessage = await chatService.sendMessage(activeChatUser._id, tempMessage.message); // ✅ Removed senderId
            // Replace temp message with real one
            setMessages((prev) => prev.map(m => m._id === tempMessage._id ? sentMessage : m));

            // Update conversation status if it was pending/null
            if (!conversationStatus) {
                const data = await chatService.getConversation(activeChatUser._id); // ✅ Removed currentUserId
                if (data.conversation) setConversationStatus(data.conversation);
            }
        } catch (error: any) {
            console.error('Error sending message:', error);
            toast.error(error.response?.data?.error || t('chat.failedToSendMessage'));
            // Remove failed message
            setMessages((prev) => prev.filter(m => m._id !== tempMessage._id));
        }
    };

    const handleRequestAction = async (action: 'accept' | 'block') => {
        if (!conversationStatus?._id || !currentUser?._id) return;
        try {
            const updatedConv = await chatService.handleRequest(conversationStatus._id, action); // ✅ Removed currentUserId
            setConversationStatus(updatedConv);
            toast.success(action === 'accept' ? t('chat.chatRequestAccepted') : t('chat.userBlocked'));
        } catch (error) {
            console.error('Error handling request:', error);
            toast.error(t('chat.failedToUpdateRequest'));
        }
    };

    if (!activeChatUser) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%" color="text.secondary">
                <Typography variant="h6">{t('chat.selectChat')}</Typography>
            </Box>
        );
    }

    const isPending = conversationStatus?.status === 'pending';
    const isBlocked = conversationStatus?.status === 'blocked';
    const isInitiator = conversationStatus?.initiator === currentUser?._id;

    const showRequestUI = isPending && !isInitiator;
    const showWaitingUI = isPending && isInitiator;

    return (
        <Box display="flex" flexDirection="column" height="100%" bgcolor="#ffffff">
            {/* Header */}
            <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 0, bgcolor: 'white', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}>
                <Avatar src={activeChatUser.avatar} sx={{ width: 40, height: 40, border: '2px solid #ff9800' }}>
                    {activeChatUser.firstName[0]}
                </Avatar>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {activeChatUser.firstName} {activeChatUser.lastName}
                    </Typography>
                </Box>
            </Paper>

            {/* Messages Area */}
            <Box
                flex={1}
                p={3}
                sx={{
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    bgcolor: '#ffffff'
                }}
            >
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress sx={{ color: '#ff9800' }} />
                    </Box>
                ) : messages.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%" color="text.secondary">
                        <Typography>{t('chat.noMessagesYet')}</Typography>
                    </Box>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId._id === currentUser?._id;
                        return (
                            <Box
                                key={msg._id || index}
                                sx={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '70%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMe ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        bgcolor: isMe ? '#ff9800' : '#f5f5f5',
                                        color: isMe ? 'white' : 'text.primary',
                                        borderRadius: 2,
                                        borderTopRightRadius: isMe ? 0 : 2,
                                        borderTopLeftRadius: isMe ? 2 : 0,
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <Typography variant="body1">{msg.message}</Typography>
                                </Paper>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ mt: 0.5, px: 0.5 }}
                                >
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            </Box>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Request UI */}
            {showRequestUI && (
                <Paper elevation={2} sx={{ p: 2, m: 2, textAlign: 'center', bgcolor: 'white', color: 'text.primary', border: 1, borderColor: 'divider' }}>
                    <Typography variant="body1" gutterBottom>
                        {activeChatUser.firstName} {t('chat.wantsToChat')}
                    </Typography>
                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                            variant="contained"
                            sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
                            startIcon={<CheckIcon />}
                            onClick={() => handleRequestAction('accept')}
                        >
                            {t('chat.accept')}
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<BlockIcon />}
                            onClick={() => handleRequestAction('block')}
                        >
                            {t('chat.block')}
                        </Button>
                    </Stack>
                </Paper>
            )}

            {/* Waiting UI */}
            {showWaitingUI && (
                <Box p={1} bgcolor="#fff3e0" textAlign="center">
                    <Typography variant="body2" color="#ff9800">
                        {t('chat.requestSent')}
                    </Typography>
                </Box>
            )}

            {/* Blocked UI */}
            {isBlocked && (
                <Box p={2} bgcolor="#ffebee" textAlign="center">
                    <Typography variant="body1" color="error">
                        {t('chat.conversationBlocked')}
                    </Typography>
                </Box>
            )}

            {/* Input Area */}
            {(!isBlocked && (!isPending || isInitiator)) && (
                <Box p={2} bgcolor="white" borderTop={1} borderColor="divider">
                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '16px' }}>
                        <TextField
                            fullWidth
                            placeholder={t('chat.typeMessage')}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: '#f8f9fa',
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#ff9800',
                                    },
                                }
                            }}
                        />
                        <IconButton
                            type="submit"
                            disabled={!newMessage.trim()}
                            sx={{
                                bgcolor: '#ff9800',
                                color: 'white',
                                width: 56,
                                height: 56,
                                '&:hover': { bgcolor: '#f57c00' },
                                '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
                            }}
                        >
                            <SendIcon />
                        </IconButton>
                    </form>
                </Box>
            )}
        </Box>
    );
};

export default ChatWindow;
