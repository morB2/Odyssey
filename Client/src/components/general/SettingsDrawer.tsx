import { useState } from 'react';
import {
    Drawer,
    Box,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemText,
    Switch,
    IconButton,
    Button
} from '@mui/material';
import { X, Moon, Sun, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../context/SettingsContext';
import ConfirmDialog from '../general/ConfirmDialog';
import { updateUser } from '../../services/user.service';
import { useUserStore } from '../../store/userStore';

interface SettingsDrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
    const { t } = useTranslation();
    const { mode, toggleMode } = useSettings();

    const { user, clearUser, token } = useUserStore(); // ✅ YOUR STORE

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDeactivateAccount = async () => {
        if (!user?._id) return;

        try {
            setLoading(true);

            await updateUser(user._id, {
                status: false
            });
            clearUser();
        } catch (error) {
            console.error('Failed to deactivate account:', error);
        } finally {
            setLoading(false);
            setConfirmOpen(false);
        }
    };

    return (
        <>
            <Drawer
                anchor="right"
                open={open}
                onClose={onClose}
                disableScrollLock={true}
                PaperProps={{
                    sx: {
                        width: 300,
                        bgcolor: 'background.paper',
                        backgroundImage: 'none'
                    }
                }}
            >
                {/* Header */}
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="bold">
                        {t('settings.title')}
                    </Typography>
                    <IconButton onClick={onClose}>
                        <X size={20} />
                    </IconButton>
                </Box>

                <Divider />

                {/* Display */}
                <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                        {t('settings.display')}
                    </Typography>

                    <List disablePadding>
                        <ListItem sx={{ px: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                <Box
                                    sx={{
                                        mr: 2,
                                        p: 1,
                                        borderRadius: '50%',
                                        bgcolor: mode === 'dark'
                                            ? 'rgba(255,255,255,0.05)'
                                            : 'rgba(0,0,0,0.05)',
                                        display: 'flex'
                                    }}
                                >
                                    {mode === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                                </Box>

                                <ListItemText
                                    primary={t('settings.darkMode')}
                                    secondary={mode === 'dark'
                                        ? t('settings.on')
                                        : t('settings.off')
                                    }
                                />
                            </Box>

                            <Switch
                                checked={mode === 'dark'}
                                onChange={toggleMode}
                                color="secondary"
                            />
                        </ListItem>
                    </List>
                </Box>

                <Divider />

                {/* Danger Zone */}
                <Box sx={{ p: 2 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{ mb: 2, fontWeight: 600, color: 'error.main' }}
                    >
                        {t('settings.dangerZone')}
                    </Typography>

                    <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<AlertTriangle size={18} />}
                        onClick={() => setConfirmOpen(true)}
                        sx={{ textTransform: 'none' }}
                        disabled={loading}
                    >
                        {t('settings.deactivateAccount')}
                    </Button>
                </Box>
            </Drawer>

            {/* ✅ Confirmation */}
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDeactivateAccount}
                title={t('settings.confirmTitle')}
                message={t('settings.confirmMessage')}
            />
        </>
    );
}
