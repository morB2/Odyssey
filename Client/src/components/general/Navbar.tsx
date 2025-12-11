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

import { BookImage, Sparkles, MessageCircleMore, Menu, X, User, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';

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
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => {
    let mounted = true;

    const fetchUnread = async () => {
      if (!user?._id) return setUnreadCount(0);
      try {
        const data = await chatService.getUnreadCount();
        const count = typeof data === 'number' ? data : (data?.count ?? data?.unread ?? 0);
        console.log('Fetched unread count:', count);
        if (mounted) setUnreadCount(count);
      } catch (err) {
        console.error('Failed to fetch unread count', err);
      }
    };

    fetchUnread();
    // return () => (mounted = false);
  }, [user]);

  // Listen for new messages to increment unread count
  useSocketEvent('newMessage', (message: any) => {
    // If message is for me and I'm not the sender
    if (user && message.receiverId._id === user._id) {
      setUnreadCount(prev => prev + 1);
    }
  });

  // Listen for read receipts to update unread count
  useSocketEvent('messagesRead', (data: any) => {
    // If I read messages (on another device/tab or this one), refresh count
    if (user && (data.byUserId === user._id)) {
      // Re-fetch to be accurate
      chatService.getUnreadCount().then(data => {
        const count = typeof data === 'number' ? data : (data?.count ?? data?.unread ?? 0);
        setUnreadCount(count);
      });
    }
  });

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
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
    padding: '8px 12px',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      transform: 'translateY(-2px)'
    }
  };

  const drawerContent = (
    <Box sx={{ width: 250, height: '100%', bgcolor: '#1a1a1a', color: 'white', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
          <X />
        </IconButton>
      </Box>

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <img src="/logo-white.png" alt="Odyssey Logo" style={{ height: 60 }} />
      </Box>

      <List>
        {user ? (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMobileNavigate('/feed')}>
                <BookImage size={20} /><ListItemText sx={{ ml: 1 }} primary={t('feed')} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMobileNavigate('/createtrip')}>
                <Sparkles size={20} /><ListItemText sx={{ ml: 1 }} primary={t('createTrip.create')} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMobileNavigate('/chats')}>
                <MessageCircleMore size={20} />
                <ListItemText sx={{ ml: 1 }} primary={t('messages')} />
                {unreadCount > 0 && <Box sx={{ width: 8, height: 8, bgcolor: '#f97316', borderRadius: '50%', ml: 1 }} />}
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMobileNavigate('/profile')}>
                <User size={20} /><ListItemText sx={{ ml: 1 }} primary={t('profile.profile')} />
              </ListItemButton>
            </ListItem>

            {user?.role === 'admin' && (
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleMobileNavigate('/admin/dashboard')}>
                  <LayoutDashboard size={20} /><ListItemText sx={{ ml: 1 }} primary={t('admin.admin')} />
                </ListItemButton>
              </ListItem>
            )}

            <ListItem disablePadding>
              <ListItemButton onClick={() => {
                const clearUser = useUserStore.getState().clearUser;
                clearUser(); handleMobileNavigate('/')
              }}>
                <LogOut size={20} /><ListItemText sx={{ ml: 1 }} primary={t('profileMenu.logout')} />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMobileNavigate('/login?tab=login', { backgroundLocation: location.pathname })}>
                <LogIn size={20} /><ListItemText sx={{ ml: 1 }} primary={t('logIn')} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMobileNavigate('/login?tab=signup', { backgroundLocation: location.pathname })}>
                <UserPlus size={20} /><ListItemText sx={{ ml: 1 }} primary={t('signUp')} />
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

  return (
    <>
      <AppBar position="fixed" sx={{
        background: 'linear-gradient(135deg, rgba(75,27,2,.95), rgba(174,131,66,.95))',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3)'
      }}>
        <Toolbar sx={{ px: { xs: 2, md: 6 }, py: 1.5, justifyContent: 'space-between' }}>

          <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img src="/logo-white.png" alt="Odyssey" style={{ height: 80 }} />
          </Link>

          {isMobile ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Search />
              <IconButton onClick={handleDrawerToggle} color="inherit"><Menu /></IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Search />
              <Box onClick={() => navigate('/feed')} sx={navItemStyle}><BookImage size={24} /><Typography variant="caption">{t('feed')}</Typography></Box>
              <Box onClick={() => navigate('/createtrip')} sx={navItemStyle}><Sparkles size={24} /><Typography variant="caption">{t('createTrip.create')}</Typography></Box>
              {user && (
                <>

                  {/* Messages */}
                  <Box onClick={() => navigate('/chats')} sx={{ ...navItemStyle, position: 'relative' }}>
                    <MessageCircleMore size={24} />
                    {unreadCount > 0 && (
                      <Box sx={{
                        position: 'absolute', top: 4, right: 8,
                        background: 'linear-gradient(135deg,#f97316,#ea580c)',
                        width: 20, height: 20, borderRadius: '50%',
                        color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        fontSize: '0.7rem', fontWeight: 'bold', fontFamily: 'Arial'
                      }}>
                        {unreadCount}
                      </Box>
                    )}
                    <Typography variant="caption">{t('messages')}</Typography>
                  </Box>
                </>
              )}



              {user?.role === "admin" && (
                <Tooltip arrow>
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
                  <Button onClick={() => navigate('/login?tab=login', { state: { backgroundLocation: location.pathname } })} sx={{ color: 'white' }}>{t('logIn')}</Button>
                  <Button variant="contained" onClick={() => navigate('/login?tab=signup', { state: { backgroundLocation: location.pathname } })}
                    sx={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                    {t('signUp')}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}
        sx={{ display: { xs: 'block', lg: 'none' } }} >
        {drawerContent}
      </Drawer>

      <Toolbar sx={{ height: { xs: 70, md: 95 } }} />
    </>
  );
};

export default Navbar;
