import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import ChatList from './ChatList';
import { useChat } from '../../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../general/Navbar';

const AllChatsPage: React.FC = () => {
    const { openChat } = useChat();
    const navigate = useNavigate();

    return (
        <>
        <Navbar />
        <Container maxWidth="md" sx={{ mt: 12, mb: 6 }}>
            <Paper sx={{ height: '70vh', overflow: 'hidden' }} elevation={1}>
                <ChatList
                    onSelectChat={(user) => {
                        openChat(user);
                    }}
                    onClose={() => navigate('/')}
                />
            </Paper>
        </Container>
        </>
    );
};

export default AllChatsPage;
