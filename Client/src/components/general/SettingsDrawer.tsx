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
    useTheme
} from '@mui/material';
import { X, Moon, Sun, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../context/SettingsContext';

interface SettingsDrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
    const { t } = useTranslation();
    const { mode, toggleMode } = useSettings();
    const theme = useTheme();

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 300,
                    bgcolor: 'background.paper',
                    backgroundImage: 'none'
                }
            }}
        >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">
                    Settings
                </Typography>
                <IconButton onClick={onClose}>
                    <X size={20} />
                </IconButton>
            </Box>

            <Divider />

            <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                    DISPLAY
                </Typography>

                <List disablePadding>
                    <ListItem sx={{ px: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                            <Box
                                sx={{
                                    mr: 2,
                                    p: 1,
                                    borderRadius: '50%',
                                    bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                    display: 'flex'
                                }}
                            >
                                {mode === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            </Box>
                            <ListItemText
                                primary="Dark Mode"
                                secondary={mode === 'dark' ? "On" : "Off"}
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

        </Drawer>
    );
}
