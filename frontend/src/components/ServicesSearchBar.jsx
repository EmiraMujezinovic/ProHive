import React, { useState, useRef, useEffect } from 'react';
import searchIcon from '../assets/icons/search.png';
import filterIcon from '../assets/icons/filter.png';
import exitIcon from '../assets/icons/exit.png';

/**
 * ServicesSearchBar
 * Props:
 * - placeholder: string
 * - onViewFavoritesToggle: function (receives new state)
 * - showFavoritesOnly: boolean
 * - onSearch: function (searchValue)
 * - onCategoryFilter: function (categoryId or null)
 * - categories: array of { ServiceCategoryId, Service }
 * - activeCategoryId: number|null
 */
const ServicesSearchBar = ({
  placeholder = 'Search services...',
  onViewFavoritesToggle,
  showFavoritesOnly,
  onSearch,
  onCategoryFilter,
  categories = [],
  activeCategoryId = null
}) => {
  const [value, setValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef();

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (onSearch) onSearch(value);
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line
  }, [value]);

  const handleSearchClick = () => {
    if (onSearch) onSearch(value);
  };

  const handleFilterClick = () => {
    if (activeCategoryId) {
      // Remove filter
      onCategoryFilter && onCategoryFilter(null);
    } else {
      setShowDropdown(v => !v);
    }
  };

  const handleCategorySelect = (catId) => {
    setShowDropdown(false);
    onCategoryFilter && onCategoryFilter(catId);
  };

  return (
    <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center gap-2 mt-4 relative">
      <div className="flex flex-1 items-center gap-2 bg-white border border-secondary rounded-lg shadow px-3 py-1 w-full h-10 min-h-0 relative">
        <input
          type="text"
          className="flex-1 px-2 py-1 bg-transparent text-md text-text focus:outline-none h-8 min-h-0"
          placeholder={placeholder}
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <button type="button" className="p-1 hover:bg-accent/10 rounded transition h-8 w-8 flex items-center justify-center cursor-pointer" title="Search" onClick={handleSearchClick}>
          <img src={searchIcon} alt="Search" className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="p-1 hover:bg-accent/10 rounded transition h-8 w-8 flex items-center justify-center cursor-pointer"
          title={activeCategoryId ? 'Remove filter' : 'Filter'}
          onClick={e => { e.stopPropagation(); handleFilterClick(); }}
        >
          <img src={activeCategoryId ? exitIcon : filterIcon} alt="Filter" className="w-5 h-5" />
        </button>
        {showDropdown && !activeCategoryId && (
          <div className="absolute top-12 left-0 z-50 bg-white border border-secondary rounded shadow w-64 max-h-60 overflow-y-auto" onClick={e => e.stopPropagation()}>
            {categories.length === 0 ? (
              <div className="p-3 text-gray-500 text-sm">No categories</div>
            ) : (
              categories.map((cat, idx) => (
                <div
                  key={cat.serviceCategoryId || idx}
                  className="px-4 py-2 hover:bg-accent/10 cursor-pointer text-text text-sm"
                  onClick={() => handleCategorySelect(cat.serviceCategoryId)}
                >
                  {cat.service}
                </div>
              ))
            )}
          </div>
        )}
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
