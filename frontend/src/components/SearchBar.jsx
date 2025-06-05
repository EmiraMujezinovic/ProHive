import React, { useState, useRef } from 'react';
import searchIcon from '../assets/icons/search.png';

/**
 * SearchBar component for searching services (now functional with debounce)
 */
const SearchBar = ({ placeholder = "Search services...", onSearch }) => {
  const [value, setValue] = useState('');
  const debounceRef = useRef();

  const handleChange = e => {
    const val = e.target.value;
    setValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (onSearch) onSearch(val);
    }, 400);
  };

  const handleButtonClick = () => {
    if (onSearch) onSearch(value);
  };

  return (
    <div className="w-full max-w-xs flex items-center gap-2">
      <input
        type="text"
        className="w-full px-4 py-2 border border-secondary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-white text-gray-700 placeholder-gray-400"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;
