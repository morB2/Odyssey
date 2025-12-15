import React from 'react';
import { Box, TextField, CircularProgress } from '@mui/material';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PostsFilterBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    isLoading: boolean;
}

const PostsFilterBar: React.FC<PostsFilterBarProps> = ({
    searchQuery,
    onSearchChange,
    isLoading
}) => {
    const { t } = useTranslation();

    return (
        <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "#18181B",
            p: 1.5,
            borderRadius: 1,
            mb: 3
        }}>
            <Search size={20} color="gray" />
            <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder={t('PostsManagement.search_placeholder') || 'Search by title, author, or category...'}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                sx={{
                    '& .MuiInputBase-input': { color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                }}
            />
            {isLoading && searchQuery && (
                <CircularProgress size={20} sx={{ color: 'gray' }} />
            )}
        </Box>
    );
};

export default PostsFilterBar;
