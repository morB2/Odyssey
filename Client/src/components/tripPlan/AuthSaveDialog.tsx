import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Stack
} from '@mui/material';
import { Printer, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
interface AuthSaveDialogProps {
    open: boolean;
    onClose: () => void;
    onLogin: () => void;
    onPrint: () => void;
}

export default function AuthSaveDialog({ open, onClose, onLogin, onPrint }: AuthSaveDialogProps) {
    const { t } = useTranslation();
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxWidth: 400,
                    p: 1
                }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                <Typography variant="h5" fontWeight="bold" color="#ff6b35">
                    {t('saveWhenNotLoggedIn.title')}
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        {t('saveWhenNotLoggedIn.description')}
                    </Typography>

                    <Stack spacing={2}>
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<LogIn size={20} />}
                            onClick={onLogin}
                            sx={{
                                bgcolor: '#ff6b35',
                                '&:hover': { bgcolor: '#e65100' },
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '1rem'
                            }}
                        >
                            {t('saveWhenNotLoggedIn.login')}
                        </Button>

                        <Box sx={{ position: 'relative', my: 2 }}>
                            <Typography variant="caption" sx={{ bgcolor: 'white', px: 1, color: 'text.secondary', position: 'relative', zIndex: 1 }}>
                                {t('saveWhenNotLoggedIn.or')}
                            </Typography>
                            <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', bgcolor: '#eee' }} />
                        </Box>

                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<Printer size={20} />}
                            onClick={onPrint}
                            sx={{
                                borderColor: '#ff6b35',
                                color: '#ff6b35',
                                '&:hover': { borderColor: '#e65100', bgcolor: '#fff3e0' },
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            {t('saveWhenNotLoggedIn.print')}
                        </Button>
                    </Stack>
                </Box>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                    onClick={onClose}
                    sx={{
                        color: 'text.secondary',
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'transparent', color: 'text.primary' }
                    }}
                >
                    {t('saveWhenNotLoggedIn.maybeLater')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
