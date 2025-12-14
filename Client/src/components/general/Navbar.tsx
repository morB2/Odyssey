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
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider,
  Tooltip
} from '@mui/material';

import {
  BookImage,
  Sparkles,
  MessageCircleMore,
  Menu,
  X,
  User,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut
} from 'lucide-react';

import { useUserStore } from '../../store/userStore';
import ProfileMenu from '../user/ProfileMenu';
import LanguageSwitcher from './LanguageSwitcher';
import Search from './Search';
import { useTranslation } from 'react-i18next';
import chatService from '../../services/chat.service';
import { useSocketEvent } from '../../hooks/useSocket';

const Navbar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const user = useUserStore((state) => state.user);

  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  /* ---------------- unread messages ---------------- */

  useEffect(() => {
    let mounted = true;

    const fetchUnread = async () => {
      if (!user?._id) return setUnreadCount(0);
      try {
        const data = await chatService.getUnreadCount();
        const count =
          typeof data === 'number'
            ? data
            : data?.count ?? data?.unread ?? 0;

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

  useSocketEvent('newMessage', (message: any) => {
    if (user && message.receiverId?._id === user._id) {
      setUnreadCount((prev) => prev + 1);
    }
  });

  useSocketEvent('messagesRead', (data: any) => {
    // If I read messages (byUserId === me), update my count
    if (user && data.byUserId === user._id) {
       chatService.getUnreadCount().then((res) => {
        const count = typeof res === 'number' ? res : res?.count ?? res?.unread ?? 0;
        setUnreadCount(count);
      });
    }
    // If someone read MY messages (I am the sender), my unread count doesn't change, but I might want to know (read receipts) - not handled here
  });

  /* ---------------- handlers ---------------- */

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  const handleMobileNavigate = (path: string, state?: any) => {
    navigate(path, { state });
    setMobileOpen(false);
  };

  const navItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    color: 'white',
    px: 1.5,
    py: 1,
    borderRadius: '12px',
    transition: 'all 0.25s ease',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.12)',
      transform: 'translateY(-2px)'
    }
  };

  /* ---------------- drawer content (mobile) ---------------- */

  const drawerContent = (
    <Box sx={{ width: 260, height: '100%', bgcolor: '#1a1a1a', color: 'white', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
          <X />
        </IconButton>
      </Box>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <img src="/logo-white.png" alt="Odyssey Logo" style={{ height: 60 }} />
      </Box>

      {/* 🔍 SEARCH (mobile only – inside drawer) */}
      <Box sx={{ mb: 3 }}>
        <Search />
      </Box>

      <Divider sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />

      <List>
        {user ? (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMobileNavigate('/feed')}>
                <BookImage size={20} />
                <ListItemText sx={{ ml: 1 }} primary={t('feed')} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMobileNavigate('/createtrip')}>
                <Sparkles size={20} />
                <ListItemText sx={{ ml: 1 }} primary={t('createTrip.create')} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMobileNavigate('/chats')}>
                <MessageCircleMore size={20} />
                <ListItemText sx={{ ml: 1 }} primary={t('messages')} />
                {unreadCount > 0 && (
                  <Box sx={{ width: 8, height: 8, bgcolor: '#f97316', borderRadius: '50%', ml: 1 }} />
                )}
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMobileNavigate('/profile')}>
                <User size={20} />
                <ListItemText sx={{ ml: 1 }} primary={t('profile.profile')} />
              </ListItemButton>
            </ListItem>

            {user.role === 'admin' && (
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleMobileNavigate('/admin/dashboard')}>
                  <LayoutDashboard size={20} />
                  <ListItemText sx={{ ml: 1 }} primary={t('admin.admin')} />
                </ListItemButton>
              </ListItem>
            )}

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  useUserStore.getState().clearUser();
                  handleMobileNavigate('/');
                }}
              >
                <LogOut size={20} />
                <ListItemText sx={{ ml: 1 }} primary={t('profileMenu.logout')} />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() =>
                  handleMobileNavigate('/login?tab=login', {
                    backgroundLocation: location.pathname
                  })
                }
              >
                <LogIn size={20} />
                <ListItemText sx={{ ml: 1 }} primary={t('logIn')} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() =>
                  handleMobileNavigate('/login?tab=signup', {
                    backgroundLocation: location.pathname
                  })
                }
              >
                <UserPlus size={20} />
                <ListItemText sx={{ ml: 1 }} primary={t('signUp')} />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>

      <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <LanguageSwitcher />
      </Box>
    </Box>
  );

  /* ---------------- render ---------------- */

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(135deg, rgba(75,27,2,.95), rgba(174,131,66,.95))',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 6 }, py: 1.5, justifyContent: 'space-between' }}>
          <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo-white.png" alt="Odyssey" style={{ height: 75 }} />
          </Link>

          {/* MOBILE */}
          {isMobile ? (
            <IconButton onClick={handleDrawerToggle} color="inherit">
              <Menu />
            </IconButton>
          ) : (
            /* DESKTOP */
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Search />

              <Box onClick={() => navigate('/feed')} sx={navItemStyle}>
                <BookImage size={24} />
                <Typography variant="caption">{t('feed')}</Typography>
              </Box>

              <Box onClick={() => navigate('/createtrip')} sx={navItemStyle}>
                <Sparkles size={24} />
                <Typography variant="caption">{t('createTrip.create')}</Typography>
              </Box>

              {user && (
                <Box onClick={() => navigate('/chats')} sx={{ ...navItemStyle, position: 'relative' }}>
                  <MessageCircleMore size={24} />
                  {unreadCount > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 8,
                        background: 'linear-gradient(135deg,#f97316,#ea580c)',
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {unreadCount}
                    </Box>
                  )}
                  <Typography variant="caption">{t('messages')}</Typography>
                </Box>
              )}

              {user?.role === 'admin' && (
                <Tooltip arrow title={t('admin.admin')}>
                  <Box onClick={() => navigate('/admin/dashboard')} sx={navItemStyle}>
                    <LayoutDashboard size={22} />
                    <Typography variant="caption">{t('admin.admin')}</Typography>
                  </Box>
                </Tooltip>
              )}

              <LanguageSwitcher />
              {user ? (
                <ProfileMenu />
              ) : (
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    onClick={() => navigate('/login?tab=login', { state: { backgroundLocation: location.pathname } })}
                    sx={{ color: 'white' }}
                  >
                    {t('logIn')}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login?tab=signup', { state: { backgroundLocation: location.pathname } })}
                    sx={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
                  >
                    {t('signUp')}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Toolbar >
      </AppBar >

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{ display: { xs: 'block', lg: 'none' } }}
      >
        {drawerContent}
      </Drawer>

      <Toolbar sx={{ height: { xs: 70, md: 95 } }} />
    </>
  );
};

export default Navbar;
