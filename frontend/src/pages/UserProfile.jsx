import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let response;
        if (role === 'Freelancer') {
          response = await fetch(`/api/Users/user-freelancer-info?userId=${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else if (role === 'Client') {
          // You may need to fetch clientProfileId first if not in localStorage
          let clientProfileId = localStorage.getItem('clientProfileId');
          if (!clientProfileId) {
            // Try to get it from user info endpoint if needed
            const userRes = await fetch(`/api/Users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
            if (userRes.ok) {
              const userJson = await userRes.json();
              clientProfileId = userJson.clientProfileId;
            }
          }
          response = await fetch(`/api/Users/client-profile/${clientProfileId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [role, userId, token]);

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!userData) return null;

  // Extract user and profile info
  const { user, freelancerProfile, clientProfile } = userData;
  const profile = freelancerProfile || clientProfile;

  return (
    <div className="min-h-screen bg-background pt-30">
      <Navbar />
      <div className="max-w-xl p-8 mx-auto bg-white/90 rounded-2xl shadow-2xl border-2 border-accent/40">
        <div className="flex flex-col items-center gap-4">
          <img
            src={user?.profileImageUrl?.startsWith('/profile-images') ? (import.meta.env.VITE_BACKEND_URL || 'https://localhost:7156') + user.profileImageUrl : user?.profileImageUrl || '/defaultprofile.jpg'}
            alt="Profile"
            className="w-32 h-32 rounded-full border-3 border-accent object-cover shadow-lg bg-white"
            onError={e => { e.currentTarget.src = '/defaultprofile.jpg'; }}
          />
          <h2 className="text-3xl font-bold text-primary drop-shadow">{user?.fullName}</h2>
          <div className="text-accent text-lg font-semibold">@{user?.username}</div>
          <div className="text-gray-700 font-medium">{user?.email}</div>
          <div className="text-gray-700">Phone: <span className="font-semibold text-accent">{user?.phoneNumber}</span></div>
          {role === 'Freelancer' && freelancerProfile && (
            <>
              <div className="mt-4 w-full">
                <div className="font-semibold text-accent">Bio:</div>
                <div className="text-gray-800 italic">{freelancerProfile.bio}</div>
              </div>
              <div className="flex gap-4 mt-2 w-full">
                <div><span className="font-semibold text-accent">Experience:</span> <span className="text-primary font-bold">{freelancerProfile.experianceLevel}</span></div>
                <div><span className="font-semibold text-accent">Location:</span> <span className="text-primary font-bold">{freelancerProfile.location}</span></div>
              </div>
            </>
          )}
          {role === 'Client' && clientProfile && (
            <>
              <div className="mt-4 w-full">
                <div className="font-semibold text-accent">Company:</div>
                <div className="text-gray-800 italic">{clientProfile.companyName}</div>
              </div>
              <div className="flex gap-4 mt-2 w-full">
                <div><span className="font-semibold text-accent">Job Title:</span> <span className="text-primary font-bold">{clientProfile.jobTitle}</span></div>
                <div><span className="font-semibold text-accent">Location:</span> <span className="text-primary font-bold">{clientProfile.location}</span></div>
              </div>
              <div className="mt-2 w-full">
                <div className="font-semibold text-accent">Description:</div>
                <div className="text-gray-800 italic">{clientProfile.description}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
