import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ServicesSearchBar from '../components/ServicesSearchBar';
import ClientServicesGridWithFavorites from '../components/ClientServicesGridWithFavorites';

const RecommendedServices = () => {
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
        setCategories(data);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch recommended services (default)
  useEffect(() => {
    if (searchValue || activeCategoryId) return; // Don't fetch all if searching or filtering
    const fetchServices = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/Recommendations/services', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch recommended services');
        const data = await res.json();
        setServices(data);
      } catch (err) {
        setError('Could not load recommended services.');
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

  // Search by title (within recommended)
  const handleSearch = async (val) => {
    setSearchValue(val);
    setActiveCategoryId(null);
    if (!val) {
      // If search is cleared, fetch recommended
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/Recommendations/services', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch recommended services');
        const data = await res.json();
        setServices(data);
      } catch (err) {
        setError('Could not load recommended services.');
      } finally {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/Recommendations/services/search?title=${encodeURIComponent(val)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to search recommended services');
      const data = await res.json();
      setServices(data);
    } catch (err) {
      setError('Could not search recommended services.');
    } finally {
      setLoading(false);
    }
  };

  // Filter by category (within recommended)
  const handleCategoryFilter = async (categoryId) => {
    setActiveCategoryId(categoryId);
    setSearchValue('');
    if (!categoryId) {
      // If filter is cleared, fetch recommended
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/Recommendations/services', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch recommended services');
        const data = await res.json();
        setServices(data);
      } catch (err) {
        setError('Could not load recommended services.');
      } finally {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/Recommendations/services/search/category?categoryId=${categoryId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to filter recommended services');
      const data = await res.json();
      setServices(data);
    } catch (err) {
      setError('Could not filter recommended services.');
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
      // Reload recommended services (to update favorite icons)
      let servicesRes;
      if (searchValue) {
        servicesRes = await fetch(`/api/Recommendations/services/search?title=${encodeURIComponent(searchValue)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (activeCategoryId) {
        servicesRes = await fetch(`/api/Recommendations/services/search/category?categoryId=${activeCategoryId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        servicesRes = await fetch('/api/Recommendations/services', {
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
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background pt-27 px-6 py-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-accent mb-6 text-center">Recommended Services</h1>
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
          <div className="text-gray-500 mt-8">No recommended services found.</div>
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

export default RecommendedServices;
