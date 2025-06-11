import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FavoriteButton from '../components/FavoriteButton';

const ClientServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/Services/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch service details');
        const data = await res.json();
        console.log('Service details response:', data); // DEBUG LOG
        setService(data);
        // Fetch freelancer full info for fullName/email if possible
        const freelancer = data.freelancer;
        if (freelancer && (freelancer.userId || freelancer.freelancerProfileId)) {
          let query = '';
          if (freelancer.freelancerProfileId) query = `freelancerProfileId=${freelancer.freelancerProfileId}`;
          else if (freelancer.userId) query = `userId=${freelancer.userId}`;
          if (query) {
            try {
              const res2 = await fetch(`/api/Users/user-freelancer-info?${query}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              });
              if (res2.ok) {
                const freelancerInfo = await res2.json();
                console.log('Freelancer full info response:', freelancerInfo); // DEBUG LOG
                setService(s => ({ ...s, freelancerFull: freelancerInfo }));
              }
            } catch {}
          }
        }
      } catch (err) {
        setError('Could not load service details.');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  // Get userId from JWT
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.userId || payload.id);
    }
  }, []);

  // Fetch favorite status for this service
  useEffect(() => {
    if (!userId || !id) return;
    const fetchFavorite = async () => {
      try {
        const res = await fetch(`/api/Services/favorites/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch favorites');
        const data = await res.json();
        setIsFavorited(data.some(fav => (fav.ServiceId || fav.serviceId) === Number(id)));
      } catch {
        setIsFavorited(false);
      }
    };
    fetchFavorite();
  }, [userId, id]);

  // Favorite toggle logic
  const handleFavoriteToggle = async (newState) => {
    setFavoriteLoading(true);
    try {
      if (newState) {
        await fetch(`/api/Services/favorite/${id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setIsFavorited(true);
      } else {
        await fetch(`/api/Services/favorite/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setIsFavorited(false);
      }
    } catch {}
    setFavoriteLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background px-4 py-8 flex flex-col items-center pt-20">
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {service && (
          <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl mt-8 border-secondary border relative flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h1 className="text-3xl font-bold text-primary break-words">{service.Title || service.title}</h1>
              <FavoriteButton
                serviceId={service.ServiceId || service.serviceId}
                isFavorited={isFavorited}
                onToggle={handleFavoriteToggle}
                disabled={favoriteLoading}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <div className="text-lg text-primary font-semibold">
                Category: <span className="text-text font-normal">{service.Category || service.category}</span>
              </div>
              <div className="text-lg text-primary font-semibold">
                Price: <span className="text-accent font-bold">${service.Price || service.price}</span>
              </div>
              <div className="text-lg text-primary font-semibold">
                Duration: <span className="text-text font-bold">{service.DurationInDays || service.durationInDays} days</span>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {(() => {
                const tagsArr = service.Tags || service.tags || [];
                if (tagsArr.length > 0) {
                  return tagsArr.map((tag, idx) => (
                    <span key={tag.TagId || tag.tagId || idx} className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-medium">
                      {tag.Tag1 || tag.tag1 || JSON.stringify(tag)}
                    </span>
                  ));
                } else {
                  return <span className="text-gray-400 text-xs">No tags</span>;
                }
              })()}
            </div>
            <div className="mb-5">
              <span className="font-semibold text-primary">Description:</span>
              <div className="mt-1 whitespace-pre-line text-text">{service.Description || service.description}</div>
            </div>
            {/* Freelancer info */}
            <div className="flex items-center gap-4 mt-4 p-4 bg-background rounded-lg border border-secondary">
              {/* Profile image logic: use backend URL if needed */}
              <img
                src={(service.freelancer?.profileImageUrl && (service.freelancer?.profileImageUrl.startsWith('/profile-images')
                  ? (import.meta.env.VITE_BACKEND_URL || 'https://localhost:7156') + service.freelancer.profileImageUrl
                  : service.freelancer.profileImageUrl)) || '/defaultprofile.jpg'}
                alt="Profile"
                className="w-15 h-15 rounded-full object-cover border border-secondary"
                onError={e => { e.currentTarget.src = '/defaultprofile.jpg'; }}
              />
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-text">
                  {service.freelancerFull?.user?.fullName || 'Ime nije dostupno'}
                </span>
                <span className="text-md text-accent">
                  {service.freelancer?.username || service.freelancerFull?.user?.username || 'unknown'}
                </span>
                <span className="text-md text-accent">
                  {service.freelancerFull?.user?.email || 'Email nije dostupan'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ClientServiceDetails;
