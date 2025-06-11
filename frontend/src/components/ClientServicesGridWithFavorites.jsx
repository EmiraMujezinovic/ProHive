import React, { useEffect, useState } from 'react';
import ClientServiceCard from './ClientServiceCard';

/**
 * ClientServicesGridWithFavorites
 * Wrapper for grid of ClientServiceCard, handles fetching favorites and favorite logic.
 * Props:
 * - services: array of service objects
 */
const ClientServicesGridWithFavorites = ({ services, onServiceClick }) => {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState({}); // { [serviceId]: bool }

  // Get userId from JWT (payload) or from /api/Auth/me
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoadingFavorites(true);
      try {
        // Try to get userId from JWT
        const token = localStorage.getItem('token');
        let userId = null;
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.userId || payload.id;
        }
        if (!userId) return;
        const res = await fetch(`/api/Services/favorites/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch favorites');
        const data = await res.json();
        setFavoriteIds(data.map(fav => fav.ServiceId || fav.serviceId));
      } catch {
        setFavoriteIds([]);
      } finally {
        setLoadingFavorites(false);
      }
    };
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = async (serviceId, newState) => {
    setFavoriteLoading(fl => ({ ...fl, [serviceId]: true }));
    try {
      if (newState) {
        // Add to favorites
        await fetch(`/api/Services/favorite/${serviceId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setFavoriteIds(ids => [...ids, serviceId]);
      } else {
        // Remove from favorites
        await fetch(`/api/Services/favorite/${serviceId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setFavoriteIds(ids => ids.filter(id => id !== serviceId));
      }
    } catch {}
    setFavoriteLoading(fl => ({ ...fl, [serviceId]: false }));
  };

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {services.map(service => {
        const id = service.ServiceId || service.serviceId;
        return (
          <ClientServiceCard
            key={id}
            serviceId={id}
            title={service.Title || service.title}
            price={service.Price || service.price}
            category={service.Category || service.category}
            tags={service.Tags ? (service.Tags.map(t => t.Tag1 || t.tag1)) : (service.tags ? service.tags.map(t => t.Tag1 || t.tag1) : [])}
            profileImageUrl={service.Freelancer && service.Freelancer.ProfileImageUrl ? service.Freelancer.ProfileImageUrl : (service.freelancer && service.freelancer.profileImageUrl)}
            fullName={service.Freelancer && service.Freelancer.FullName ? service.Freelancer.FullName : (service.freelancer && service.freelancer.fullName)}
            freelancerProfileId={service.Freelancer && service.Freelancer.FreelancerProfileId ? service.Freelancer.FreelancerProfileId : (service.freelancer && service.freelancer.freelancerProfileId)}
            isFavorited={favoriteIds.includes(id)}
            onFavoriteToggle={isNowFav => handleFavoriteToggle(id, isNowFav)}
            favoriteButtonDisabled={loadingFavorites || favoriteLoading[id]}
            onClick={() => onServiceClick && onServiceClick(id)}
          />
        );
      })}
    </div>
  );
};

export default ClientServicesGridWithFavorites;
