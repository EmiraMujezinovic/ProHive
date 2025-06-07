import React, { useState } from 'react';
import favoriteIcon from '../assets/icons/favorite.png';
import favoritedIcon from '../assets/icons/favorited.png';

/**
 * FavoriteButton component
 * Props:
 * - serviceId: number|string
 * - isFavorited: boolean
 * - onToggle: function (called after toggle, receives new state)
 * - disabled: boolean (optional)
 */
const FavoriteButton = ({ serviceId, isFavorited, onToggle, disabled }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (loading || disabled) return;
    setLoading(true);
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const url = `/api/Services/favorite/${serviceId}`;
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to update favorite');
      if (onToggle) onToggle(!isFavorited);
    } catch (err) {
      // Optionally show error
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`p-1 rounded-full  bg-white shadow hover:bg-secondary/50 transition flex items-center cursor-pointer justify-center hover:scale-110 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      disabled={loading || disabled}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      type="button"
    >
      <img
        src={isFavorited ? favoritedIcon : favoriteIcon}
        alt={isFavorited ? 'Favorited' : 'Favorite'}
        className="w-6 h-6"
      />
    </button>
  );
};

export default FavoriteButton;
