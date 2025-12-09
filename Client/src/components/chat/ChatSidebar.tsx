import React, { useState, useEffect } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Tabs,
    Tab,
    Badge,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    ListItemButton,
    InputAdornment,
    IconButton
} from '@mui/material';
import { useUserStore } from '../../store/userStore';
import chatService from '../../services/chat.service';
import userService from '../../services/user.service';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

interface ChatSidebarProps {
    onSelectChat: (user: any) => void;
    activeChatUser: any;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onSelectChat, activeChatUser }) => {
    const { t } = useTranslation();
    const { user } = useUserStore();
    const [conversations, setConversations] = useState<any[]>([]);
    const [tabValue, setTabValue] = useState(0);
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    // Refresh conversations periodically or on socket event (parent should handle socket update trigger ideally, but we can just fetch on mount for now)
    // For real-time updates, we might want to expose a refresh method or listen to context.
    // For now, let's rely on the fact that if a new message comes in, the parent might trigger a re-render or we can listen to socket here too.
    // Actually, let's just fetch on mount.

    const fetchConversations = async () => {
        if (!user) return;
        try {
            const data = await chatService.getConversations(); // ✅ Removed userId
            setConversations(data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleOpenNewChat = async () => {
        setIsNewChatOpen(true);
        try {
            const users = await userService.getAllUsers();
            // Filter out current user
            setAllUsers(users.filter((u: any) => u._id !== user?._id));
            setSearchResults(users.filter((u: any) => u._id !== user?._id));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = allUsers.filter(u =>
            u.firstName.toLowerCase().includes(term) ||
            u.lastName.toLowerCase().includes(term)
        );
        setSearchResults(filtered);
    };

    const startNewChat = (selectedUser: any) => {
        onSelectChat(selectedUser);
        setIsNewChatOpen(false);
        setSearchTerm('');
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
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', borderRight: 1, borderColor: 'divider', bgcolor: 'white' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'white', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">{t('chat.chats')}</Typography>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenNewChat}
                    sx={{
                        borderRadius: 4,
                        textTransform: 'none',
                        bgcolor: '#ff9800',
                        '&:hover': { bgcolor: '#f57c00' }
                    }}
                >
                    {t('chat.newChat')}
                </Button>
            </Box>

            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="chat tabs"
                variant="fullWidth"
                sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    '& .MuiTab-root': { color: 'text.secondary' },
                    '& .Mui-selected': { color: '#ff9800' },
                    '& .MuiTabs-indicator': { bgcolor: '#ff9800' }
                }}
            >
                <Tab label={t('chat.all')} />
                <Tab label={
                    <Badge badgeContent={conversations.filter(c => c.status === 'pending' && c.initiator !== user._id).length} color="error">
                        {t('chat.requests')}
                    </Badge>
                } />
            </Tabs>

            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                {filteredConversations.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {tabValue === 0 ? t('chat.noChatsYet') : t('chat.noNewRequests')}
                        </Typography>
                    </Box>
                ) : (
                    filteredConversations.map((conv) => {
                        const otherParticipant = conv.participants.find((p: any) => p._id !== user._id);
                        const isActive = activeChatUser?._id === otherParticipant._id;
                        return (
                            <ListItem
                                key={conv._id}
                                disablePadding
                            >
                                <ListItemButton
                                    selected={isActive}
                                    onClick={() => onSelectChat(otherParticipant)}
                                    alignItems="flex-start"
                                    sx={{
                                        '&.Mui-selected': {
                                            bgcolor: '#fff3e0', // Light orange
                                            '&:hover': { bgcolor: '#ffe0b2' },
                                            borderLeft: '4px solid #ff9800'
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
                                            <Typography fontWeight={isActive ? 'bold' : 'normal'}>
                                                {otherParticipant.firstName} {otherParticipant.lastName}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ display: 'inline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}
                                            >
                                                {conv.lastMessage ? conv.lastMessage.message : t('chat.noMessagesYet')}
                                            </Typography>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })
                )}
            </List>

            {/* New Chat Dialog */}
            <Dialog open={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        {t('chat.newChat')}
                        <IconButton onClick={() => setIsNewChatOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        placeholder={t('chat.searchUsers')}
                        value={searchTerm}
                        onChange={handleSearch}
                        margin="dense"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <List sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                        {searchResults.map((u) => (
                            <ListItem key={u._id} disablePadding>
                                <ListItemButton onClick={() => startNewChat(u)}>
                                    <ListItemAvatar>
                                        <Avatar src={u.avatar}>{u.firstName[0]}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={`${u.firstName} ${u.lastName}`} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                        {searchResults.length === 0 && (
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                                {t('UsersManagement.noUsersFound')}
                            </Typography>
                        )}
                    </List>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default ChatSidebar;
