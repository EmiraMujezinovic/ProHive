import React from 'react';

/**
 * SearchBar component for searching services (UI only, not functional yet)
 */
const SearchBar = ({ placeholder = "Search services..." }) => {
  return (
    <div className="w-full max-w-xs">
      <input
        type="text"
        className="w-full px-4 py-2 border border-secondary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-white text-gray-700 placeholder-gray-400 cursor-text"
        placeholder={placeholder}
        disabled
      />
    </div>
  );
};

export default SearchBar;
