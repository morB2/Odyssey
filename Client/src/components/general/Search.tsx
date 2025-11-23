import React, { useState, useEffect, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import useDebounce from '../../hooks/useDebounce';

const OrangeTextField = styled(TextField)({
  '& label': {
    color: 'white',
  },
  '& label.Mui-focused': {
    color: '#FF9800',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: '#FF9800',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    '& fieldset': {
      borderColor: 'white',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FF9800',
    },
    '&:hover fieldset': {
      borderColor: '#FFB74D',
    },
  },
});

interface SearchProps {
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
  initialValue?: string;
  debounceDelay?: number;
}

const Search: React.FC<SearchProps> = ({
  placeholder = 'Search...',
  onSearch,
  initialValue = '',
  debounceDelay = 500
}) => {
  const [instantSearchTerm, setInstantSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(instantSearchTerm, debounceDelay);

  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInstantSearchTerm(event.target.value);
  }, []);

  return (
    <OrangeTextField
      label={placeholder}
      variant="outlined"
      size="small"
      fullWidth={false}
      value={instantSearchTerm}
      onChange={handleChange}
      sx={{ width: 250, color: 'white' }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: '#d0ab81' }} />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default Search;