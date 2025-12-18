import { useState, useEffect, useCallback } from 'react';
import { Box, TextField, CircularProgress, IconButton } from '@mui/material';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Constants
const ICON_SIZE = 20;
const LOADING_SPINNER_SIZE = 20;
const DEBOUNCE_DELAY = 300; // milliseconds to wait before triggering search

const FILTER_BAR_STYLE = {display: "flex",alignItems: "center",gap: 1,backgroundColor: "#18181B",p: 1.5,borderRadius: 1,mb: 3};

const TEXT_FIELD_STYLE = {'& .MuiInputBase-input': { color: 'white' },'& .MuiOutlinedInput-notchedOutline': { border: 'none' },};

interface PostsFilterBarProps {searchQuery: string;onSearchChange: (value: string) => void;isLoading: boolean;}

const PostsFilterBar: React.FC<PostsFilterBarProps> = ({searchQuery,onSearchChange,isLoading
}) => {
    const { t } = useTranslation();

    // Local state for immediate UI updates (debounced search)
    const [localQuery, setLocalQuery] = useState(searchQuery);

    // Sync local state with prop changes (e.g., when parent clears the search)
    useEffect(() => {
        setLocalQuery(searchQuery);
    }, [searchQuery]);

    // Debounce the search to reduce server requests during typing
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(localQuery);
        }, DEBOUNCE_DELAY);

        // Cleanup: cancel the timer if user types again before delay expires
        return () => clearTimeout(timer);
    }, [localQuery, onSearchChange]);

    // Memoized handler to prevent unnecessary re-renders
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalQuery(e.target.value);
    }, []);

    // Clear search handler
    const handleClearSearch = useCallback(() => {
        setLocalQuery('');
        onSearchChange('');
    }, [onSearchChange]);

    return (
        <Box sx={FILTER_BAR_STYLE}>
            {/* Search icon */}
            <Search size={ICON_SIZE} color="gray" />

            {/* Search input field */}
            <TextField fullWidth variant="outlined" size="small" placeholder={t('PostsManagement.search_placeholder') || 'Search by title, author, or category...'} value={localQuery} onChange={handleSearchChange} sx={TEXT_FIELD_STYLE} aria-label={t('PostsManagement.search_aria_label') || 'Search posts'} />

            {/* Clear button - only shown when there's text */}
            {localQuery && (
                <IconButton size="small" onClick={handleClearSearch} sx={{ color: 'gray', p: 0.5 }} aria-label="Clear search">
                    <X size={16} />
                </IconButton>
            )}

            {/* Loading indicator - only shown during active search */}
            {isLoading && searchQuery && (
                <CircularProgress size={LOADING_SPINNER_SIZE} sx={{ color: 'gray' }} />
            )}
        </Box>
    );
};

export default PostsFilterBar;
