import { useState, type MouseEvent } from 'react';
import {
    Avatar,
    Menu,
    MenuItem,
    IconButton,
    Typography,
    Box,
} from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { useTranslation } from 'react-i18next';

interface ProfileMenuProps {
    size?: number;
}

export default function ProfileMenu({ size = 50 }: ProfileMenuProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const user = useUserStore((state) => state.user);
    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMyAccount = () => {
        handleClose();
        navigate('/profile');
    };

    const handleLogout = () => {
        handleClose();
        const clearUser = useUserStore.getState().clearUser;
        clearUser();
        navigate('/');
    };

    const handleMouseEnter = (event: MouseEvent<HTMLElement>) => {
        if (!open) {
            setAnchorEl(event.currentTarget);
        }
    };

    if (!user) {
        return null;
    }

    const avatarUrl = user.avatar || '';
    const initials = user.firstName?.[0] || 'U';

    return (
        <Box>
            <IconButton
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                sx={{
                    p: 0,
                    '&:hover': {
                        opacity: 0.8,
                    },
                }}
            >
                <Avatar
                    src={user.avatar||avatarUrl}
                    alt={user.firstName || 'User'}
                    sx={{
                        width: size,
                        height: size,
                        cursor: 'pointer',
                        border: '2px solid transparent',
                        transition: 'border-color 0.2s',
                        '&:hover': {
                            borderColor: 'primary.main',
                        },
                    }}
                >
                    {!avatarUrl && initials}
                </Avatar>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onMouseLeave={handleClose}
                disableScrollLock={true}
                MenuListProps={{
                    onMouseLeave: handleClose,
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        mt: 1.5,
                        minWidth: 200,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        '& .MuiMenuItem-root': {
                            px: 2,
                            py: 1.5,
                            gap: 1.5,
                        },
                    },
                }}
            >
                <MenuItem onClick={handleMyAccount}>
                    <AccountCircle fontSize="small" />
                    <Typography variant="body2">{t('profileMenu.myAccount')}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                    <Logout fontSize="small" />
                    <Typography variant="body2">{t('profileMenu.logout')}</Typography>
                </MenuItem>
            </Menu>
        </Box>
    );
}

