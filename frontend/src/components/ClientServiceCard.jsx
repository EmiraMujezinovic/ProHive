import React, { useEffect, useState } from 'react';
import FavoriteButton from './FavoriteButton';
import ratingIcon from '../assets/icons/rating.png';

/**
 * ClientServiceCard component for displaying a service to clients.
 * Props:
 * - title: string
 * - price: number | string
 * - category: string
 * - tags: array of strings
 * - profileImageUrl: string (optional, fallback to backend fetch)
 * - fullName: string (freelancer's full name)
 * - freelancerProfileId: number | string (for fetching profile image)
 * - onClick: function (optional)
 */
const ClientServiceCard = ({ title, price, category, tags, profileImageUrl, fullName, freelancerProfileId, onClick, serviceId, isFavorited, onFavoriteToggle, favoriteButtonDisabled }) => {
  const [imageUrl, setImageUrl] = useState(profileImageUrl || '/defaultprofile.jpg');
  const [rating, setRating] = useState(null);

  useEffect(() => {
    // Helper to resolve full image URL
    const resolveImageUrl = (url) => {
      if (!url) return '/defaultprofile.jpg';
      let backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://localhost:7156';
      if (backendUrl.endsWith('/')) backendUrl = backendUrl.slice(0, -1);
      if (url.startsWith('/')) {
        return backendUrl + url;
      }
      return url;
    };

    // If freelancerProfileId is provided, fetch their profile image from backend (new endpoint)
    if (freelancerProfileId) {
      fetch(`/api/Users/freelancer-profile-image/${freelancerProfileId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          if (data && data.profileImageUrl) {
            const url = resolveImageUrl(data.profileImageUrl);
            setImageUrl(url);
            console.log('Profile image URL set to:', url);
          } else {
            setImageUrl('/defaultprofile.jpg');
            console.log('Profile image fallback: /defaultprofile.jpg');
          }
        })
        .catch(() => {
          setImageUrl('/defaultprofile.jpg');
          console.log('Profile image fetch error, fallback: /defaultprofile.jpg');
        });
    } else {
      const url = resolveImageUrl(profileImageUrl);
      setImageUrl(url);
      console.log('Profile image fallback (no profileId):', url);
    }
    // eslint-disable-next-line
  }, [freelancerProfileId, profileImageUrl]);

  useEffect(() => {
    // Fetch average rating for this service
    if (serviceId) {
      fetch(`/api/Reviews/average-rating/service/${serviceId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          if (typeof data === 'number') setRating(data);
          else if (data && typeof data.averageRating === 'number') setRating(data.averageRating);
          else setRating(null);
        })
        .catch(() => setRating(null));
    }
    // eslint-disable-next-line
  }, [serviceId]);

  return (
    <div
      className="bg-background rounded-lg shadow-md p-6 flex flex-col gap-2 border border-accent hover:border-primary hover:bg-gray-100 hover:shadow-lg transition hover:scale-103 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-primary truncate" title={title}>{title}</h2>
        <FavoriteButton
          serviceId={serviceId}
          isFavorited={isFavorited}
          onToggle={onFavoriteToggle}
          disabled={favoriteButtonDisabled}
        />
      </div>
      {/* Freelancer info */}
      <div className="flex items-center gap-3 mb-1">
        <img
          src={imageUrl}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border border-secondary"
          onError={e => { e.currentTarget.src = '/defaultprofile.jpg'; }}
        />
        <span className="text-sm text-text font-medium truncate">{fullName}</span>
      </div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm text-text">
          <span className="font-medium text-accent">Category:</span> {category}
        </div>
        <span className="text-lg font-semibold text-accent ml-4">${price}</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-1 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {tags && tags.length > 0 ? (
            tags.map((tag, idx) => (
              <span key={idx} className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-medium">
                {tag}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-xs">No tags</span>
          )}
        </div>
      </div>
      {/* Rating display */}
      <div className="flex items-center gap-1 mt-2">
        <img src={ratingIcon} alt="Rating" className="w-5 h-5" />
        <span className="text-sm text-accent font-semibold">{rating !== null ? `${rating}/5` : 'No rating'}</span>
      </div>
    </div>
  );
};

export default ClientServiceCard;
