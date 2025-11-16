import { AppBar, Toolbar, Box, Button, Link } from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import ProfileMenu from '../user/ProfileMenu';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore(state => state.user);

  return (
      <AppBar position="absolute" elevation={0} sx={{ background: 'transparent' }}>
        <Toolbar sx={{ px: { xs: 2, md: 6 }, py: 2, justifyContent: 'space-between' }}>

          {/* Left side: Logo */}
          <Link
            component={RouterLink}
            to="/"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { opacity: 0.9 },
              transition: 'opacity 0.2s',
            }}
          >
            <Box 
              component="img" 
              src="/logo-white.png" 
              alt="Odyssey Logo" 
              sx={{ height: { xs: 90, md: 110 }, objectFit: 'contain' }} 
            />
          </Link>

          {/* Right side: Links + Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, mr: 3 }}>
              <Link
                component={RouterLink}
                to="/features"
                underline="none"
                sx={{ color: 'white', '&:hover': { color: '#fcd34d' }, transition: 'color 0.3s' }}
              >
                Features
              </Link>

              <Link
                component={RouterLink}
                to="/about"
                underline="none"
                sx={{ color: 'white', '&:hover': { color: '#fcd34d' }, transition: 'color 0.3s' }}
              >
                About
              </Link>
            </Box>
          </Box>
          {user ? (
            <ProfileMenu />
          ) : (
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              minWidth: 'fit-content',
              flexShrink: 0,
            }}>
              <Button
                variant="text"
                onClick={() => navigate("/login?tab=login", { state: { backgroundLocation: location.pathname } })}
                sx={{ 
                  color: 'white', 
                  mr: 1,
                  minWidth: 'auto',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                  '&:focus': { outline: 'none' },
                }}
              >
                Log In
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/login?tab=signup", { state: { backgroundLocation: location.pathname } })}
                sx={{ 
                  bgcolor: '#d97706', 
                  '&:hover': { bgcolor: '#b45309' }, 
                  fontWeight: 600,
                  minWidth: 'auto',
                  '&:focus': { outline: 'none' },
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        {/* </Box> */}
      </Toolbar>
    </AppBar>
 
  )
}

export default Navbar
