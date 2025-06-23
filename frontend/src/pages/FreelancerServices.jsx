import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MyServiceCard from '../components/MyServiceCard';
import SearchBar from '../components/SearchBar';

const FreelancerServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/Services/my', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch services');
        const data = await res.json();
        setServices(data);
      } catch (err) {
        setError('Could not load your services.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Search handler for SearchBar
  const handleSearch = async (query) => {
    if (!query) {
      // If search is cleared, reload all services
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/Services/my', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch services');
        const data = await res.json();
        setServices(data);
      } catch (err) {
        setError('Could not load your services.');
      } finally {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/Services/my/search?title=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to search services');
      const data = await res.json();
      setServices(data);
    } catch (err) {
      setError('Could not search your services.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background px-6 py-8 pt-28">
        <h1 className="text-3xl font-bold mb-8 text-text text-center">Your Services</h1>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <SearchBar onSearch={handleSearch} />
          <button
            className="bg-accent text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-secondary hover:text-text transition cursor-pointer"
            onClick={() => navigate('/addserviceform')}
          >
            Add Service
          </button>
        </div>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!loading && !error && services.length === 0 && (
          <div className="text-gray-500">You have not created any services yet.</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <MyServiceCard
              key={service.ServiceId || service.serviceId}
              title={service.Title || service.title}
              price={service.Price || service.price}
              category={service.Category || service.category}
              tags={service.Tags ? (service.Tags.map(t => t.Tag1 || t.tag1)) : (service.tags ? service.tags.map(t => t.Tag1 || t.tag1) : [])}
              onClick={() => navigate(`/myservicedetails/${service.ServiceId || service.serviceId}`)}
              serviceId={service.ServiceId || service.serviceId}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default FreelancerServices;
