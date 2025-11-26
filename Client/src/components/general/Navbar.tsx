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
              sx={{ height: { xs: 80, md: 100 }, objectFit: 'contain' }}
            />
          </Link>

          {/* Right side */}
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
                    {t('createTrip')}
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
        </Toolbar>
      </AppBar>
      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <Toolbar sx={{ py: 1.5, height: { xs: 80, md: 100 } }} />
    </>
  );
};

export default Navbar;
