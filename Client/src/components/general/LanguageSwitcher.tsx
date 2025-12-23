import { useState } from 'react';
import { Button, Menu, MenuItem, Box } from '@mui/material';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    handleClose();
  };

  const currentLang = i18n.language === 'he' ? '🇮🇱' : '🇺🇸';

  return (
    <Box>
      <Button
        onClick={handleClick}
        sx={{
          color: 'white',
          minWidth: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 2,
          py: 1,
          borderRadius: '10px',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        <Languages size={20} />
        <span style={{ fontSize: '1.2rem' }}>{currentLang}</span>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock={true}
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
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            minWidth: 150,
          },
        }}
      >
        <MenuItem
          onClick={() => handleLanguageChange('en')}
          selected={i18n.language === 'en'}
          sx={{
            py: 1.5,
            px: 2,
            '&.Mui-selected': {
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
              },
            },
          }}
        >
          🇺🇸 English
        </MenuItem>
        <MenuItem
          onClick={() => handleLanguageChange('he')}
          selected={i18n.language === 'he'}
          sx={{
            py: 1.5,
            px: 2,
            '&.Mui-selected': {
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
              },
            },
          }}
        >
          🇮🇱 עברית
        </MenuItem>
      </Menu>
    </Box>
  );
}
