import React, { useEffect, useState } from 'react';
import MessageModal from './MessageModal';

const FreelancerInfoModal = ({ userId, onClose }) => {
  const [freelancerData, setFreelancerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFreelancerInfo = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/Users/user-freelancer-info?userId=${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch freelancer info');
        const data = await res.json();
        setFreelancerData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchFreelancerInfo();
  }, [userId]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative border-2 border-accent">
        <button onClick={onClose} className="absolute cursor-pointer top-3 right-3 text-accent text-3xl font-bold">&times;</button>
        {loading ? (
          <div className="text-center text-gray-500">Loading freelancer info...</div>
        ) : error ? (
          <MessageModal message={error} onClose={onClose} title="Error" type="error" />
        ) : freelancerData && freelancerData.user && freelancerData.freelancerProfile ? (
          <>
            <div className="flex flex-col items-center gap-3 mb-6">
              <img
                src={freelancerData.user.profileImageUrl && freelancerData.user.profileImageUrl.startsWith('/profile-images')
                  ? (import.meta.env.VITE_BACKEND_URL || 'https://localhost:7156') + freelancerData.user.profileImageUrl
                  : (freelancerData.user.profileImageUrl || '/defaultprofile.jpg')}
                alt="Profile"
                className="w-24 h-24 rounded-full border-2 border-accent object-cover shadow"
                onError={e => { e.currentTarget.src = '/defaultprofile.jpg'; }}
              />
              <div className="text-xl font-bold text-primary">{freelancerData.user.fullName}</div>
              <div className="text-accent font-semibold">@{freelancerData.user.username}</div>
              <div className="text-gray-700">{freelancerData.user.email}</div>
              <div className="text-gray-700">Phone: <span className="font-semibold text-primary">{freelancerData.user.phoneNumber}</span></div>
            </div>
            <div className="mb-4">
              <div className="font-semibold text-accent">Bio:</div>
              <div className="text-gray-800 italic">{freelancerData.freelancerProfile.bio}</div>
            </div>
            <div className="flex gap-4 mb-2">
              <div><span className="font-semibold text-accent">Experience:</span> <span className="text-primary font-bold">{freelancerData.freelancerProfile.experianceLevel}</span></div>
              <div><span className="font-semibold text-accent">Location:</span> <span className="text-primary font-bold">{freelancerData.freelancerProfile.location}</span></div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default FreelancerInfoModal;
