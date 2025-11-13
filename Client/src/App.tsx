import react from 'react'
import Home from './components/general/Home'
import Login from './components/login/Login';
import { Route, Routes, useLocation } from 'react-router-dom';

import GLogin from './components/login/GoogleLogin'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Profile from './components/user/Profile';
import MainPage from './components/tripPlan/MainPage';
import { TripFeed } from './components/social/TripFeed';
import ForgotPassword from './components/login/ForgotPassword';
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID!;


function App() {
  const location = useLocation();

  const state = location.state as { backgroundLocation?: string };

  const background = state?.backgroundLocation
    ? { pathname: state.backgroundLocation }
    : location;


  return (
    <>
      <Routes location={background}>
        <Route path="/" element={<Home />} />
        <Route path="/createtrip" element={<MainPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feed" element={<TripFeed />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />

      </Routes>

      {state?.backgroundLocation && (
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      )}

    </>
  )
}

export default App
