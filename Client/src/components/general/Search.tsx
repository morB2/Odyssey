import React, { useState, useEffect, useCallback, useRef } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import useDebounce from '../../hooks/useDebounce';
import SearchResults from './SearchResults';
import { searchAll, type SearchResults as SearchResultsType } from '../../api/searchApi';
import { useUserStore } from '../../store/userStore';

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
  onSearch?: (searchTerm: string) => void;
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
  const [searchResults, setSearchResults] = useState<SearchResultsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedSearchTerm = useDebounce(instantSearchTerm, debounceDelay);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const user = useUserStore((state) => state.user);

  // Perform search when debounced term changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchTerm.trim().length === 0) {
        setSearchResults(null);
        setShowResults(false);
        return;
      }

      setLoading(true);
      setShowResults(true);

      try {
        const results = await searchAll(debouncedSearchTerm, user?._id);
        setSearchResults(results);

        // Call the optional onSearch callback
        if (onSearch) {
          onSearch(debouncedSearchTerm);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults({ users: [], trips: [] });
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, onSearch, user?._id]);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInstantSearchTerm(event.target.value);
  }, []);

  const handleFocus = () => {
    if (instantSearchTerm.trim().length > 0) {
      setShowResults(true);
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };

  return (
    <div ref={searchContainerRef} style={{ position: 'relative', width: 600 }}>
      <OrangeTextField
        label={placeholder}
        variant="outlined"
        size="small"
        fullWidth
        value={instantSearchTerm}
        onChange={handleChange}
        onFocus={handleFocus}
        sx={{ color: 'white' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#d0ab81' }} />
            </InputAdornment>
          ),
        }}
      />
      {showResults && (
        <SearchResults
          results={searchResults}
          loading={loading}
          query={instantSearchTerm}
          onClose={handleCloseResults}
        />
      )}
    </div>
  );
};

export default Search;