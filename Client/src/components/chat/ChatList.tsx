import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography, Tabs, Tab, Badge, IconButton, ListItemButton } from '@mui/material';
import { useUserStore } from '../../store/userStore';
import chatService from '../../services/chat.service';
import CloseIcon from '@mui/icons-material/Close';

interface ChatListProps {
    onSelectChat: (user: any) => void;
    onClose: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, onClose }) => {
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
            const data = await chatService.getConversations(user._id || '');
            setConversations(data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

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
                    <Tab label="Chats" />
                    <Tab label={
                        <Badge badgeContent={conversations.filter(c => c.status === 'pending' && c.initiator !== user._id).length} color="error">
                            Requests
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
                            {tabValue === 0 ? 'No conversations yet' : 'No new requests'}
                        </Typography>
                    </Box>
                ) : (
                    filteredConversations.map((conv) => {
                        const otherParticipant = conv.participants.find((p: any) => p._id !== user._id);
                        return (
                            <ListItem
                                key={conv._id}
                                disablePadding
                            >
                                <ListItemButton
                                    onClick={() => onSelectChat(otherParticipant)}
                                    alignItems="flex-start"
                                >
                                    <ListItemAvatar>
                                        <Avatar src={otherParticipant.avatar} alt={otherParticipant.firstName}>
                                            {otherParticipant.firstName[0]}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                                        secondary={
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                                sx={{ display: 'inline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                            >
                                                {conv.lastMessage ? conv.lastMessage.message : 'No messages'}
                                            </Typography>
                                        }
                                    />
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
