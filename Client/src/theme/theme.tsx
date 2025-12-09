import { createTheme } from '@mui/material/styles';

export const getTheme = (language: string, mode: 'light' | 'dark' = 'light') =>
    createTheme({
        direction: language === 'he' ? 'rtl' : 'ltr',
        palette: {
            mode,
            primary: {
                main: '#b45309', // Amber-700
                light: '#d97706', // Amber-600
                dark: '#92400e', // Amber-800
                contrastText: '#ffffff',
            },
            secondary: {
                main: '#f97316', // Orange-500
                light: '#fb923c', // Orange-400
                dark: '#ea580c', // Orange-600
                contrastText: '#ffffff',
            },
            ...(mode === 'dark' ? {
                background: {
                    default: '#121212',
                    paper: '#1e1e1e',
                },
                text: {
                    primary: '#f3f4f6', // Gray-100
                    secondary: '#9ca3af', // Gray-400
                },
                divider: 'rgba(255, 255, 255, 0.12)',
            } : {
                // Light mode defaults
                background: {
                    default: '#f3f4f6', // Gray-100/50ish
                    paper: '#ffffff',
                },
                text: {
                    primary: '#111827', // Gray-900
                    secondary: '#4b5563', // Gray-600
                }
            }),
        },
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
                        color: mode === 'dark' ? '#ffffff' : '#111827',
                    }
                }
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none', // Remove default gradient in dark mode
                    }
                }
            }
        },
        typography: {
            //כאן בוחרים פונטים שונים עבור עברית ואנגלית
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif;'
        },
    });