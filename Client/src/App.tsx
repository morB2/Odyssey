import Home from './components/general/Home'
import Login from './components/login/Login';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Profile from './components/user/Profile';
import MainPage from './components/tripPlan/MainPage';
import { TripFeed } from './components/social/TripFeed';
import ForgotPassword from './components/login/ForgotPassword';
import Dashboard from './components/admin/Dashboard';
import Page404 from './components/general/404Page';
import Page401 from './components/general/401Page';
import TermsOfService from './components/general/TermsOfService';
import PrivacyPolicy from './components/general/PrivacyPolicy';
import HelpCenter from './components/general/HelpCenter';
import Contact from './components/general/Contact';
import Footer from './components/general/Footer';
import { initializeSocket } from './services/socketService';
import { useUserStore } from './store/userStore';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'

import { ChatProvider } from './context/ChatContext';
import ChatWidget from './components/chat/ChatWidget';
import { Box } from '@mui/material';
import AllChatsPage from './components/chat/AllChatsPage';

function App() {
  const location = useLocation();
  const { token } = useUserStore();

  // Initialize Socket.IO once for the entire app
  useEffect(() => {
    if (token) {
      console.log('🔌 Initializing Socket.IO connection...');
      initializeSocket(token);
    }
  }, [token]);

  const state = location.state as { backgroundLocation?: string };

  const background = state?.backgroundLocation
    ? { pathname: state.backgroundLocation }
    : location;


  return (
    <ChatProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <ChatWidget />

      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Routes location={background}>
          <Route path="/" element={<Home />} />
          <Route path="/chats" element={<AllChatsPage />} />
          <Route path="/createtrip" element={<MainPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/feed" element={<TripFeed />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/contact" element={<Contact />} />
          <Route path='/401' element={<Page401 />} />
          <Route path="*" element={<Page404 />} />
        </Routes>

        {state?.backgroundLocation && (
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        )}

        <Footer />
      </Box>

    </ChatProvider>
  );
}

export default App
