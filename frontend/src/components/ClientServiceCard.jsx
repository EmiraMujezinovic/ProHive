import React, { useEffect, useState } from 'react';
import FavoriteButton from './FavoriteButton';

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

  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-2 border border-secondary hover:shadow-lg transition hover:scale-103 cursor-pointer"
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
    </div>
  );
};

export default ClientServiceCard;
