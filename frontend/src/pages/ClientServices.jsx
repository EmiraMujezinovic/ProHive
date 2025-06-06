import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ServicesSearchBar from '../components/ServicesSearchBar';
import ClientServiceCard from '../components/ClientServiceCard';

const ClientServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-25 px-6 py-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-primary mb-8 text-center">Browse Services</h1>
        <ServicesSearchBar />
        {loading && <div className="text-gray-500 mt-8">Loading...</div>}
        {error && <div className="text-red-500 mt-8 mb-4">{error}</div>}
        {!loading && !error && services.length === 0 && (
          <div className="text-gray-500 mt-8">No services found.</div>
        )}
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {services.map(service => (
            <ClientServiceCard
              key={service.ServiceId || service.serviceId}
              title={service.Title || service.title}
              price={service.Price || service.price}
              category={service.Category || service.category}
              tags={service.Tags ? (service.Tags.map(t => t.Tag1 || t.tag1)) : (service.tags ? service.tags.map(t => t.Tag1 || t.tag1) : [])}
              profileImageUrl={service.Freelancer && service.Freelancer.ProfileImageUrl ? service.Freelancer.ProfileImageUrl : (service.freelancer && service.freelancer.profileImageUrl)}
              fullName={service.Freelancer && service.Freelancer.FullName ? service.Freelancer.FullName : (service.freelancer && service.freelancer.fullName)}
              freelancerUserId={service.Freelancer && service.Freelancer.UserId ? service.Freelancer.UserId : (service.freelancer && service.freelancer.userId)}
              // onClick={() => ...} // Add navigation if needed
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ClientServices;
