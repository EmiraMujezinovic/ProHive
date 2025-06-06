import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ServicesSearchBar from '../components/ServicesSearchBar';
import ClientServicesGridWithFavorites from '../components/ClientServicesGridWithFavorites';

const ClientServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Fetch all services
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/Services/all', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch services');
        const data = await res.json();
        setServices(data);
      } catch (err) {
        setError('Could not load services.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Fetch favorite IDs for filtering
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
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
      }
    };
    fetchFavorites();
  }, []);

  // Filtered services for grid
  const filteredServices = showFavoritesOnly
    ? services.filter(s => favoriteIds.includes(s.ServiceId || s.serviceId))
    : services;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-25 px-6 py-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-primary mb-8 text-center">Browse Services</h1>
        <ServicesSearchBar
          onViewFavoritesToggle={setShowFavoritesOnly}
          showFavoritesOnly={showFavoritesOnly}
        />
        {loading && <div className="text-gray-500 mt-8">Loading...</div>}
        {error && <div className="text-red-500 mt-8 mb-4">{error}</div>}
        {!loading && !error && filteredServices.length === 0 && (
          <div className="text-gray-500 mt-8">No services found.</div>
        )}
        <div className="w-full max-w-6xl">
          <ClientServicesGridWithFavorites services={filteredServices} />
        </div>
      </div>
    </>
  );
};

export default ClientServices;
