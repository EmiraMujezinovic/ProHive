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
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  // Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/Services/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        console.log('Fetched categories:', data); // Debug log
        setCategories(data);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch all services (default)
  useEffect(() => {
    if (searchValue || activeCategoryId) return; // Don't fetch all if searching or filtering
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
  }, [searchValue, activeCategoryId]);

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

  // Search by title
  const handleSearch = async (val) => {
    setSearchValue(val);
    setActiveCategoryId(null);
    if (!val) {
      // If search is cleared, fetch all
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/Services/all', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch services');
        const data = await res.json();
        setServices(data);
      } catch (err) {
        setError('Could not load services.');
      } finally {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/Services/search/title?title=${encodeURIComponent(val)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to search services');
      const data = await res.json();
      setServices(data);
    } catch (err) {
      setError('Could not search services.');
    } finally {
      setLoading(false);
    }
  };

  // Filter by category
  const handleCategoryFilter = async (categoryId) => {
    setActiveCategoryId(categoryId);
    setSearchValue('');
    if (!categoryId) {
      // If filter is cleared, fetch all
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/Services/all', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch services');
        const data = await res.json();
        setServices(data);
      } catch (err) {
        setError('Could not load services.');
      } finally {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/Services/search/category?categoryId=${categoryId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to filter services');
      const data = await res.json();
      setServices(data);
    } catch (err) {
      setError('Could not filter services.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to reload favorites and services after add/remove
  const reloadFavoritesAndServices = async () => {
    try {
      const token = localStorage.getItem('token');
      let userId = null;
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.userId || payload.id;
      }
      if (!userId) return;
      // Reload favorites
      const favRes = await fetch(`/api/Services/favorites/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let favIds = [];
      if (favRes.ok) {
        const favData = await favRes.json();
        favIds = favData.map(fav => fav.ServiceId || fav.serviceId);
      }
      setFavoriteIds(favIds);
      // Reload services (to update favorite icons)
      let servicesRes;
      if (searchValue) {
        servicesRes = await fetch(`/api/Services/search/title?title=${encodeURIComponent(searchValue)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (activeCategoryId) {
        servicesRes = await fetch(`/api/Services/search/category?categoryId=${activeCategoryId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        servicesRes = await fetch('/api/Services/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      if (servicesRes && servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      }
    } catch {
      // fallback: do nothing
    }
  };

  // Always reload favorites and services when toggling favorites view
  useEffect(() => {
    reloadFavoritesAndServices();
    // eslint-disable-next-line
  }, [showFavoritesOnly]);

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
          onSearch={handleSearch}
          onCategoryFilter={handleCategoryFilter}
          categories={categories}
          activeCategoryId={activeCategoryId}
        />
        {loading && <div className="text-gray-500 mt-8">Loading...</div>}
        {error && <div className="text-red-500 mt-8 mb-4">{error}</div>}
        {!loading && !error && filteredServices.length === 0 && (
          <div className="text-gray-500 mt-8">No services found.</div>
        )}
        <div className="w-full max-w-6xl">
          <ClientServicesGridWithFavorites
            services={filteredServices}
            onServiceClick={serviceId => window.location.href = `/clientservicedetails/${serviceId}`}
            onFavoriteChange={reloadFavoritesAndServices}
          />
        </div>
      </div>
    </>
  );
};

export default ClientServices;
