import React, { useState } from 'react';
import searchIcon from '../assets/icons/search.png';
import filterIcon from '../assets/icons/filter.png';

/**
 * ServicesSearchBar
 * Props:
 * - placeholder: string
 * - onViewFavoritesToggle: function (receives new state)
 * - showFavoritesOnly: boolean
 */
const ServicesSearchBar = ({ placeholder = 'Search services...', onViewFavoritesToggle, showFavoritesOnly }) => {
  const [value, setValue] = useState('');

  return (
    <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center gap-2 mt-4">
      <div className="flex flex-1 items-center gap-2 bg-white border border-secondary rounded-lg shadow px-3 py-1 w-full h-10 min-h-0">
        <input
          type="text"
          className="flex-1 px-2 py-1 bg-transparent text-md text-text focus:outline-none h-8 min-h-0"
          placeholder={placeholder}
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <button type="button" className="p-1 hover:bg-accent/10 rounded transition h-8 w-8 flex items-center justify-center" title="Search">
          <img src={searchIcon} alt="Search" className="w-5 h-5" />
        </button>
        <button type="button" className="p-1 hover:bg-accent/10 rounded transition h-8 w-8 flex items-center justify-center" title="Filter">
          <img src={filterIcon} alt="Filter" className="w-5 h-5" />
        </button>
      </div>
      <button
        type="button"
        className={`ml-0 sm:ml-2 cursor-pointer px-4 py-2 rounded-lg font-semibold transition shadow h-10 min-h-0 flex items-center bg-accent text-white hover:bg-secondary hover:text-text`}
        onClick={() => onViewFavoritesToggle && onViewFavoritesToggle(!showFavoritesOnly)}
      >
        {showFavoritesOnly ? 'Show All' : 'View Favorites'}
      </button>
    </div>
  );
};

export default ServicesSearchBar;
