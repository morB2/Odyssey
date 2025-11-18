import type { FC } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { BookImage, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppBar, Toolbar, Box, Button, Link, Typography } from '@mui/material';
import { useUserStore } from '../../store/userStore';
import ProfileMenu from '../user/ProfileMenu';
import Search from './Search';
import LanguageSwitcher from './LanguageSwitcher';

export const Navbar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { t } = useTranslation();
  const user = useUserStore(state => state.user);

  return (
    <AppBar position="fixed" elevation={0} sx={{ background: 'transparent' }}>
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

        {/* Right side: Icons + Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Search onSearch={(searchTerm) => console.log('Search term:', searchTerm)} />
          {user && (
            <>
              {/* Feed Icon + Label */}
              <Box
                onClick={() => navigate('/feed')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  '&:hover': { opacity: 0.8 }
                }}
              >
                <BookImage size={24} />
                <Typography variant="caption" sx={{ mt: 0.3 }}>
                  Feed
                </Typography>
              </Box>

              {/* AI Trip Creator Icon + Label */}
              <Box
                onClick={() => navigate('/createtrip')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  '&:hover': { opacity: 0.8 }
                }}
              >
                <Sparkles size={24} />
                <Typography variant="caption" sx={{ mt: 0.3 }}>
                  Create Trip
                </Typography>
              </Box>
            </>
          )}
          <LanguageSwitcher />

          {user ? (
            <ProfileMenu />
          ) : (
            <Box sx={{ display: 'flex', gap: 1, minWidth: 'fit-content', flexShrink: 0 }}>
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
        </Box>
      </Toolbar>
    </AppBar>
  );
}
