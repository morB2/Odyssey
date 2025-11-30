import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Link,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import { BookImage, Sparkles, MessageCircleMore, Menu, X, User, LogIn, UserPlus } from 'lucide-react';

import { useUserStore } from '../../store/userStore';
import ProfileMenu from '../user/ProfileMenu';
import LanguageSwitcher from './LanguageSwitcher';
import Search from './Search';
import { useTranslation } from 'react-i18next';
import chatService from '../../services/chat.service';

const Navbar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const user = useUserStore((state) => state.user);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    let mounted = true;

    const fetchUnread = async () => {
      if (!user?._id) {
        setUnreadCount(0);
        return;
      }
      try {
        const data = await chatService.getUnreadCount(user._id);
        const count = typeof data === 'number' ? data : data?.unread ?? 0;
        if (mounted) setUnreadCount(count);
      } catch (err) {
        console.error('Failed to fetch unread count', err);
      }
    };

    fetchUnread();

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const navItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    color: 'white',
    transition: 'all 0.3s ease',
    padding: '8px 12px',
    borderRadius: '12px',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      transform: 'translateY(-2px)',
    },
  };

  const drawerContent = (
    <Box sx={{ width: 250, height: '100%', bgcolor: '#1a1a1a', color: 'white', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
          <X />
        </IconButton>
      </Box>

      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box
          component="img"
          src="/logo-white.png"
          alt="Odyssey Logo"
          sx={{ height: 60, objectFit: 'contain' }}
        />
      </Box>

      <List>
        {user ? (
          <>
            <ListItem component="button" onClick={() => handleMobileNavigate('/feed')} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <Box sx={{ mr: 2, display: 'flex' }}><BookImage size={20} /></Box>
              <ListItemText primary={t('feed')} />
            </ListItem>

            <ListItem component="button" onClick={() => handleMobileNavigate('/createtrip')} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <Box sx={{ mr: 2, display: 'flex' }}><Sparkles size={20} /></Box>
              <ListItemText primary={t('createTrip.create')} />
            </ListItem>

            <ListItem component="button" onClick={() => handleMobileNavigate('/chats')} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <Box sx={{ mr: 2, display: 'flex', position: 'relative' }}>
                <MessageCircleMore size={20} />
                {unreadCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      bgcolor: '#f97316',
                      borderRadius: '50%',
                      width: 8,
                      height: 8,
                    }}
                  />
                )}
              </Box>
              <ListItemText primary={t('messages') ?? 'Messages'} />
            </ListItem>

            <ListItem component="button" onClick={() => handleMobileNavigate('/profile')} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <Box sx={{ mr: 2, display: 'flex' }}><User size={20} /></Box>
              <ListItemText primary={t('profile.title') || 'Profile'} />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem component="button" onClick={() => handleMobileNavigate('/login?tab=login')} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <Box sx={{ mr: 2, display: 'flex' }}><LogIn size={20} /></Box>
              <ListItemText primary={t('logIn')} />
            </ListItem>
            <ListItem component="button" onClick={() => handleMobileNavigate('/login?tab=signup')} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <Box sx={{ mr: 2, display: 'flex' }}><UserPlus size={20} /></Box>
              <ListItemText primary={t('signUp')} />
            </ListItem>
          </>
        )}
      </List>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <LanguageSwitcher />
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, rgba(75, 27, 2, 0.95) 0%, rgba(174, 131, 66, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 6 }, py: 1.5, justifyContent: 'space-between' }}>
          {/* Logo */}
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
              sx={{ height: { xs: 60, md: 100 }, objectFit: 'contain' }}
            />
          </Link>

          {/* Mobile Menu Button */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Search onSearch={(s) => console.log('Search term:', s)} />
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <Menu />
              </IconButton>
            </Box>
          )}

          {/* Desktop Menu */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Search onSearch={(s) => console.log('Search term:', s)} />

              {user && (
                <>
                  {/* Feed */}
                  <Box onClick={() => navigate('/feed')} sx={navItemStyle}>
                    <BookImage size={24} />
                    <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.75rem', fontWeight: 500 }}>
                      {t('feed')}
                    </Typography>
                  </Box>

                  {/* Create Trip */}
                  <Box onClick={() => navigate('/createtrip')} sx={navItemStyle}>
                    <Sparkles size={24} />
                    <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.75rem', fontWeight: 500 }}>
                      {t('createTrip.create')}
                    </Typography>
                  </Box>

                  {/* Messages */}
                  <Box onClick={() => navigate('/chats')} sx={{ ...navItemStyle, position: 'relative' }}>
                    <MessageCircleMore size={24} />

                    {/* Unread badge */}
                    {unreadCount > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 8,
                          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          color: 'white',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          fontSize: '0.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(249, 115, 22, 0.4)',
                          border: '2px solid rgba(15, 23, 42, 0.95)',
                        }}
                      >
                        {unreadCount}
                      </Box>
                    )}

                    <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.75rem', fontWeight: 500 }}>
                      {t('messages') ?? 'Messages'}
                    </Typography>
                  </Box>
                </>
              )}

              <LanguageSwitcher />

              {/* Auth / Profile */}
              {user ? (
                <ProfileMenu />
              ) : (
                <Box sx={{ display: 'flex', gap: 1.5, minWidth: 'fit-content', flexShrink: 0 }}>
                  <Button
                    variant="text"
                    onClick={() =>
                      navigate('/login?tab=login', {
                        state: { backgroundLocation: location.pathname },
                      })
                    }
                    sx={{
                      color: 'white',
                      minWidth: 'auto',
                      px: 2.5,
                      py: 1,
                      borderRadius: '10px',
                      fontWeight: 500,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {t('logIn')}
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() =>
                      navigate('/login?tab=signup', {
                        state: { backgroundLocation: location.pathname },
                      })
                    }
                    sx={{
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      fontWeight: 600,
                      minWidth: 'auto',
                      px: 3,
                      py: 1,
                      borderRadius: '10px',
                      boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                        boxShadow: '0 6px 20px rgba(249, 115, 22, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {t('signUp')}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <Toolbar sx={{ py: 1.5, height: { xs: 80, md: 100 } }} />
    </>
  );
};

export default Navbar;
