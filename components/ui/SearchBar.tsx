import React, { useState, useEffect, useCallback } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  className?: string;
  showClearButton?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = 'Search...', 
  onSearch, 
  debounceMs = 300,
  className = '',
  showClearButton = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs, onSearch]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className={`relative ${className}`}>
      <div className={`relative flex items-center transition-all duration-200 ${
        isFocused ? 'ring-2 ring-teal-500 rounded-lg' : ''
      }`}>
        <div className="absolute left-3 pointer-events-none">
          <i className={`fas fa-search text-slate-400 transition-colors duration-200 ${
            isFocused ? 'text-teal-500' : ''
          }`}></i>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors duration-200"
          aria-label="Search"
        />
        {showClearButton && searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors duration-200"
            aria-label="Clear search"
            type="button"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
      {searchQuery && (
        <div className="absolute left-0 right-0 mt-1 text-xs text-slate-500 px-1">
          Searching for: <span className="font-medium text-teal-600">{searchQuery}</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
