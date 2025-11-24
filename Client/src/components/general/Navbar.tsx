import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Box, Button, Link, Typography } from '@mui/material';
import { BookImage, Sparkles, MessageCircleMore } from 'lucide-react';

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

  return (
    <AppBar position="fixed" elevation={0} sx={{ background: 'transparent' }}>
      <Toolbar sx={{ px: { xs: 2, md: 6 }, py: 2, justifyContent: 'space-between' }}>
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
            sx={{ height: { xs: 90, md: 110 }, objectFit: 'contain' }}
          />
        </Link>

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Search onSearch={(s) => console.log('Search term:', s)} />

          {user && (
            <>
              {/* Feed */}
              <Box
                onClick={() => navigate('/feed')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  '&:hover': { opacity: 0.8 },
                }}
              >
                <BookImage size={24} />
                <Typography variant="caption" sx={{ mt: 0.3 }}>
                  {t('feed')}
                </Typography>
              </Box>

              {/* Create Trip */}
              <Box
                onClick={() => navigate('/createtrip')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  '&:hover': { opacity: 0.8 },
                }}
              >
                <Sparkles size={24} />
                <Typography variant="caption" sx={{ mt: 0.3 }}>
                  {t('createTrip')}
                </Typography>
              </Box>

              {/* Messages */}
              <Box
                onClick={() => navigate('/chats')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  position: 'relative',
                  '&:hover': { opacity: 0.8 },
                }}
              >
                <MessageCircleMore size={24} />

                {/* Unread badge */}
                {unreadCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -5,
                      right: -8,
                      background: 'red',
                      color: 'white',
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    {unreadCount}
                  </Box>
                )}

                <Typography variant="caption" sx={{ mt: 0.3 }}>
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
            <Box sx={{ display: 'flex', gap: 1, minWidth: 'fit-content', flexShrink: 0 }}>
              <Button
                variant="text"
                onClick={() =>
                  navigate('/login?tab=login', {
                    state: { backgroundLocation: location.pathname },
                  })
                }
                sx={{
                  color: 'white',
                  mr: 1,
                  minWidth: 'auto',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
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
                  bgcolor: '#d97706',
                  '&:hover': { bgcolor: '#b45309' },
                  fontWeight: 600,
                  minWidth: 'auto',
                }}
              >
                {t('signUp')}
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
