import { useEffect, type FC } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { AlertTriangle } from 'lucide-react';
import { t } from 'i18next';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
 
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 3,
          maxWidth: '448px',
        }
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          }
        }
      }}
    >
      <DialogContent sx={{ p: 0, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: '#fed7aa',
            }}
          >
            <AlertTriangle size={20} color="#ea580c" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                color: '#171717',
                fontSize: '1.125rem',
                fontWeight: 600,
              }}
            >
              {t(title)}
            </Typography>
            <Typography
              sx={{
                color: '#525252',
                fontSize: '0.875rem',
              }}
            >
              {t(message)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 0, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: '#d4d4d4',
            color: '#171717',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#a3a3a3',
              backgroundColor: '#fafafa',
            }
          }}
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{
            backgroundColor: '#f97316',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#ea580c',
            }
          }}
        >
          {t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}