import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  
  Typography,
} from '@mui/material';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'lg' }: ModalProps) {
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

  const maxWidthMap = {
    sm: '384px',
    md: '448px',
    lg: '512px',
    xl: '576px',
    '2xl': '672px',
    '4xl': '896px',
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: maxWidthMap[maxWidth],
          maxHeight: '90vh',
          m: 2,
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
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e5e5e5',
          px: 3,
          py: 2,
          position: 'sticky',
          top: 0,
          backgroundColor: '#ffffff',
          zIndex: 10,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#171717',
          }}
        >
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#94a3b8',
            p: 0.5,
            borderRadius: 2,
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: '#f1f5f9',
              color: '#475569',
            },
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 3,
        }}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}