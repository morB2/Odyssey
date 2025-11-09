import react from 'react'
import Home from './components/Home'
import GLogin from './components/GoogleLogin'
import Login from './components/Login';
import { Route, Routes, useLocation } from 'react-router-dom';

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
