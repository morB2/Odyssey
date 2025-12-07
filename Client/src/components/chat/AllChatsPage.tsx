import React, { useState } from 'react';
import { Container, Paper, Box } from '@mui/material';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';

const AllChatsPage: React.FC = () => {
    const [activeChatUser, setActiveChatUser] = useState<any>(null);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Container maxWidth="xl" sx={{ mb: 2, flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
                <Paper
                    elevation={3}
                    sx={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        borderRadius: 2
                    }}
                >
                    {/* Sidebar */}
                    <Box sx={{ width: { xs: '100%', md: 320 }, borderRight: 1, borderColor: 'divider', display: { xs: activeChatUser ? 'none' : 'block', md: 'block' } }}>
                        <ChatSidebar
                            onSelectChat={setActiveChatUser}
                            activeChatUser={activeChatUser}
                        />
                    </Box>

                    {/* Chat Window */}
                    <Box sx={{ flexGrow: 1, display: { xs: activeChatUser ? 'block' : 'none', md: 'block' } }}>
                        <ChatWindow activeChatUser={activeChatUser} />
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default AllChatsPage;
