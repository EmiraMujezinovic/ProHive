import React, { useState } from 'react';
import searchIcon from '../assets/icons/search.png';
import filterIcon from '../assets/icons/filter.png';

const ServicesSearchBar = ({ placeholder = 'Search services...' }) => {
  const [value, setValue] = useState('');

  return (
    <div className="w-full max-w-2xl flex items-center gap-3 bg-white border border-secondary rounded-lg shadow px-4 py-3 mt-4">
      <input
        type="text"
        className="flex-1 px-4 py-2 bg-transparent text-lg text-text focus:outline-none"
        placeholder={placeholder}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button type="button" className="p-2 hover:bg-accent/10 rounded transition" title="Search">
        <img src={searchIcon} alt="Search" className="w-6 h-6" />
      </button>
      <button type="button" className="p-2 hover:bg-accent/10 rounded transition" title="Filter">
        <img src={filterIcon} alt="Filter" className="w-6 h-6" />
      </button>
      <button type="button" className="ml-2 px-4 py-2 rounded-lg bg-accent text-white font-semibold hover:bg-secondary hover:text-text transition shadow">
        View Favorites
      </button>
    </div>
  );
};

export default ServicesSearchBar;
