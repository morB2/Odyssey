import { createTheme } from '@mui/material/styles';

export const getTheme = (language: string) =>
    createTheme({
        direction: language === 'he' ? 'rtl' : 'ltr',
        palette: {
            primary: { main: '#b45309' },
            secondary: { main: '#f97316' },
        },
        typography: {
            //כאן בוחרים פונטים שונים עבור עברית ואנגלית
            fontFamily: "'Merriweather', serif"
        },
    });