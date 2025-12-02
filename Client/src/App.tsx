
import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Profile from './components/user/Profile';
import { TripFeed } from './components/social/TripFeed';
import ForgotPassword from './components/login/ForgotPassword';
import Dashboard from './components/admin/Dashboard';
import { useTranslation } from 'react-i18next';
import { Login } from './components/login/Login';
import { Home } from './components/general/Home';
import { getTheme } from './theme/theme';
import { CacheProvider } from '@emotion/react';
import { cacheRtl, cacheLtr } from './theme/rtl';
import { ThemeProvider } from '@mui/material/styles';

import Page404 from './components/general/404Page';
import Page401 from './components/general/401Page';
import TermsOfService from './components/general/TermsOfService';
import PrivacyPolicy from './components/general/PrivacyPolicy';
import HelpCenter from './components/general/HelpCenter';
import Contact from './components/general/Contact';
import Footer from './components/general/Footer';
import { MainPage } from './components/tripPlan/MainPage';
import { CreateTrip } from './components/tripPlan/CreateTrip';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { initializeSocket } from './services/socketService';
import { useUserStore } from './store/userStore';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { ChatProvider } from './context/ChatContext';
import ChatWidget from './components/chat/ChatWidget';
import { Box } from '@mui/material';
import AllChatsPage from './components/chat/AllChatsPage';
import { ResetPasswordPage } from './components/login/ResetPassword';
import CreateTripLandingPage from './components/tripPlan/createTripLandingPage';

function App() {
  const location = useLocation();
  const { token } = useUserStore();

  useEffect(() => {
    if (token) {
      console.log('🔌 Initializing Socket.IO connection...');
      initializeSocket(token);
    }
  }, [token]);

  const { i18n } = useTranslation();
  const theme = getTheme(i18n.language);

  useEffect(() => {
    document.body.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const state = location.state as { backgroundLocation?: string };
  const background = state?.backgroundLocation
    ? { pathname: state.backgroundLocation }
    : location;

  return (
    <ChatProvider>
      <CacheProvider value={i18n.language === 'he' ? cacheRtl : cacheLtr}>
        <ThemeProvider theme={theme}>
          <ToastContainer position="top-right" autoClose={3000} />
          <ChatWidget />

          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            {/* Main Routes */}
            <Routes location={background}>
              <Route path="/" element={<Home />} />
              <Route path="/chats" element={<AllChatsPage />} />
              <Route path="/createtrip" element={<CreateTripLandingPage />} />
              <Route path="/createtripAI" element={<MainPage />} />
              <Route path="/createtripmanual" element={<CreateTrip />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/feed" element={<TripFeed />} />
              <Route path="/forgotPassword" element={<ForgotPassword />} />
              <Route path="/resetPassword" element={<ResetPasswordPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/401" element={<Page401 />} />
              <Route path="*" element={<Page404 />} />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requireAdmin={true}>
                  <Dashboard />
                </ProtectedRoute>
              } />
            </Routes>

            {/* Modal routes (login popup) */}
            {state?.backgroundLocation && (
              <Routes>
                <Route path="/login" element={<Login />} />
              </Routes>
            )}

            <Footer />
          </Box>
        </ThemeProvider>
      </CacheProvider>
    </ChatProvider>
  );
}

export default App;
