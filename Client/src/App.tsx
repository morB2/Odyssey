import react, { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Profile from './components/user/Profile';
import MainPage from './components/tripPlan/MainPage';
import { TripFeed } from './components/social/TripFeed';
import ForgotPassword from './components/login/ForgotPassword';
import Dashboard from './components/admin/Dashboard';
import { useTranslation } from 'react-i18next';
import { Login } from './components/login/Login';
import { Home } from './components/general/Home';
import { getTheme } from './theme/theme';
import { CacheProvider } from '@emotion/react';
import { cacheRtl } from './theme/rtl';
import { ThemeProvider } from '@mui/material/styles';
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID!;

import Page404 from './components/general/404Page';
import Page401 from './components/general/401Page';
import { initializeSocket } from './services/socketService';
import { useUserStore } from './store/userStore';
import './App.css'

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
    <>
      <CacheProvider value={cacheRtl}>
        <ThemeProvider theme={theme}>
          <Routes location={background}>
            <Route path="/" element={<Home />} />
            <Route path="/createtrip" element={<MainPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/feed" element={<TripFeed />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path='/401' element={<Page401 />} />
        <Route path="*" element={<Page404 />} />

          </Routes>

          {state?.backgroundLocation && (
            <Routes>
              <Route path="/login" element={<Login />} />
            </Routes>
          )}
        </ThemeProvider>
      </CacheProvider>
    </>
  )
}

export default App
