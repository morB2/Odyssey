import React from 'react'
import { AppBar, Toolbar, Box, Button, Link, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

function Navbar() {
    const navigate = useNavigate();
  const user = useUserStore(state => state.user);
  
  const handleLogout = () => {
  const clearUser = useUserStore.getState().clearUser; 
  clearUser();
  navigate("/");
};

  return (
    <div>
      {/* Header */}
      <AppBar position="absolute" elevation={0} sx={{ background: 'transparent' }}>
        <Toolbar sx={{ px: { xs: 2, md: 6 }, py: 2, justifyContent: 'space-between' }}>

          {/* Left side: Logo */}
          <Box component="img" src="/logo-white.png" alt="Odyssey Logo" sx={{ height: { xs: 90, md: 110 }, objectFit: 'contain' }} />

          {/* Right side: Links + Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, mr: 3 }}>
              <Link href="#features" underline="none" sx={{ color: 'white', '&:hover': { color: '#fcd34d' }, transition: 'color 0.3s' }}>Features</Link>
              <Link href="#about" underline="none" sx={{ color: 'white', '&:hover': { color: '#fcd34d' }, transition: 'color 0.3s' }}>About</Link>
            </Box>
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ color: 'white' }}>Welcome, {user.firstName}!</Typography>
                <Button
                  variant="outlined"
                  onClick={handleLogout}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', bgcolor: '#d97706' },
                  }}
                >
                  Log Out
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="text"
                  onClick={() => navigate("/login?tab=login", { state: { backgroundLocation: location.pathname } })}
                  sx={{ color: 'white', mr: 1, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                >
                  Log In
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate("/login?tab=signup", { state: { backgroundLocation: location.pathname } })}
                  sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' }, fontWeight: 600 }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
 
    </div>
  )
}

export default Navbar
