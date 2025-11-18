import { useState } from 'react';
import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);

  const handleChange = (_: React.MouseEvent<HTMLElement>, newLang: string | null) => {
    if (!newLang) return;
    setLang(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
      <ToggleButtonGroup
        value={lang}
        exclusive
        onChange={handleChange}
        sx={{
          backgroundColor: '#f3f4f6',
          borderRadius: 3,
          boxShadow: 1,
          '& .MuiToggleButton-root': {
            textTransform: 'none',
            px: 3,
            py: 1,
            borderRadius: 2,
            fontWeight: 500
          },
          '& .Mui-selected': {
            backgroundColor: '#f97316',
            color: 'white',
            '&:hover': { backgroundColor: '#ea580c' }
          }
        }}
      >
        <ToggleButton value="en">🇺🇸 English</ToggleButton>
        <ToggleButton value="he">🇮🇱 עברית</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
