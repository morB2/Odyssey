import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography, Tabs, Tab, Badge, IconButton, ListItemButton } from '@mui/material';
import { useUserStore } from '../../store/userStore';
import chatService from '../../services/chat.service';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { useSocketEvent } from '../../hooks/useSocket';

interface ChatListProps {
    onSelectChat: (user: any) => void;
    onClose: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, onClose }) => {
    const { t } = useTranslation();
    const { user } = useUserStore();
    const [conversations, setConversations] = useState<any[]>([]);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    const fetchConversations = async () => {
        if (!user) return;
        try {
            const data = await chatService.getConversations(); // ✅ Removed userId
            setConversations(data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    // Real-time updates for new messages
    useSocketEvent('newMessage', (message: any) => {
        if (!user) return;

        setConversations(prev => {
            // Check if conversation exists
            const existingConvIndex = prev.findIndex(c =>
                c.participants.some((p: any) => p._id === message.senderId._id || p._id === message.receiverId._id) &&
                c.participants.some((p: any) => p._id === user._id)
            );

            if (existingConvIndex !== -1) {
                // Move to top and update last message
                const updatedConv = { ...prev[existingConvIndex] };
                updatedConv.lastMessage = message;
                updatedConv.updatedAt = message.createdAt;

                const newConvs = [...prev];
                newConvs.splice(existingConvIndex, 1);
                return [updatedConv, ...newConvs];
            } else {
                // New conversation - re-fetch to get full details properly populated
                fetchConversations();
                return prev;
            }
        });
    });

    // Real-time updates for read receipts
    useSocketEvent('messagesRead', (data: any) => {
        if (!user) return;

        // If I read messages from someone, update that conversation to read
        // if (data.byUserId === user._id) {
        //     // We don't have the otherUserId directly in the event if it was emitted to me as 'byUserId'
        //     // But usually we want to clear the unread status for the conversation I just read
        //     // The event structure I added in backend: { byUserId: userId, read: true }
        //     // Wait, I need to know WHICH conversation was read to update the list locally without refetching.
        //     // The backend event didn't include otherUserId for the sender. 
        //     // Let's just refetch for simplicity and correctness, or I can update the backend to send conversationId.
        //     // For now, refetching is safest.
        //     fetchConversations();
        // }
    });

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const filteredConversations = conversations.filter(conv => {
        if (!user) return false;
        if (tabValue === 0) {
            // All chats (accepted or pending where I am initiator)
            return conv.status === 'accepted' || (conv.status === 'pending' && conv.initiator === user._id);
        } else {
            // Requests (pending where I am NOT initiator)
            return conv.status === 'pending' && conv.initiator !== user._id;
        }
    });

    if (!user) return null;

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="chat tabs">
                    <Tab label={t('chat.chats')} />
                    <Tab label={
                        <Badge badgeContent={conversations.filter(c => c.status === 'pending' && c.initiator !== user._id).length} color="error">
                            {t('chat.requests')}
                        </Badge>
                    } />
                </Tabs>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                {filteredConversations.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {tabValue === 0 ? t('chat.noChatsYet') : t('chat.noNewRequests')}
                        </Typography>
                    </Box>
                ) : (
                    filteredConversations.map((conv) => {
                        const otherParticipant = conv.participants.find((p: any) => p._id !== user._id);

                        // Check if unread: last message exists, is NOT read, and I am the receiver
                        const isUnread = conv.lastMessage &&
                            !conv.lastMessage.read &&
                            conv.lastMessage.receiverId === user._id;

                        return (
                            <ListItem
                                key={conv._id}
                                disablePadding
                            >
                                <ListItemButton
                                    onClick={() => onSelectChat(otherParticipant)}
                                    alignItems="flex-start"
                                    sx={{
                                        bgcolor: isUnread ? 'rgba(255, 152, 0, 0.08)' : 'transparent',
                                        '&:hover': {
                                            bgcolor: isUnread ? 'rgba(255, 152, 0, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar src={otherParticipant.avatar} alt={otherParticipant.firstName}>
                                            {otherParticipant.firstName[0]}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="subtitle1"
                                                component="span"
                                                fontWeight={isUnread ? 'bold' : 'normal'}
                                            >
                                                {`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color={isUnread ? "text.primary" : "text.secondary"}
                                                fontWeight={isUnread ? 'bold' : 'normal'}
                                                sx={{ display: 'inline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                            >
                                                {conv.lastMessage ? conv.lastMessage.message : t('chat.noMessagesYet')}
                                            </Typography>
                                        }
                                    />
                                    {isUnread && (
                                        <Box sx={{
                                            width: 10,
                                            height: 10,
                                            bgcolor: '#ff9800',
                                            borderRadius: '50%',
                                            ml: 1,
                                            alignSelf: 'center'
                                        }} />
                                    )}
                                </ListItemButton>
                            </ListItem>
                        );
                    })
                )}
            </List>
        </Box>
    );
};

export default ChatList;
