import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MessageModal from '../components/MessageModal';

const statusMap = {
  1: 'Pending',
  2: 'Accepted',
  3: 'Rejected',
  4: 'Withdrawn',
  5: 'Canceled',
  6: 'Completed',
};

const ClientApplicationDetails = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/Applications/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch application details');
        const data = await res.json();
        setApplication(data);
        // Fetch freelancer info
        if (data.freelancer && data.freelancer.userId) {
          const fres = await fetch(`/api/Users/user-freelancer-info?userId=${data.freelancer.userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          if (fres.ok) {
            const fdata = await fres.json();
            setFreelancer(fdata);
          }
        }
      } catch {
        setError('Could not load application details.');
      }
      setLoading(false);
    };
    fetchApplication();
  }, [id]);

  // Funkcija za zatvaranje modala i refresh stranice
  const handleModalClose = () => {
    setError('');
    window.location.reload();
  };

  // Funkcija za slanje zahteva za promenu statusa aplikacije
  const handleStatusAction = async (action) => {
    if (!application) return;
    let url = '';
    switch (action) {
      case 'accept':
        url = `/api/Applications/accept/${application.applicationId}`;
        break;
      case 'reject':
        url = `/api/Applications/reject/${application.applicationId}`;
        break;
      case 'cancel':
        url = `/api/Applications/cancel/${application.applicationId}`;
        break;
      case 'complete':
        url = `/api/Applications/complete/${application.applicationId}`;
        break;
      default:
        return;
    }
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Action failed.');
      window.location.reload();
    } catch {
      setError('Action failed.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background px-4 py-8 flex flex-col items-center pt-25">
        <h1 className="text-3xl font-bold text-primary mb-6">Application Details</h1>
        {loading && <div className="text-gray-500">Loading...</div>}
        {/* Uklonjen prikaz greske iznad i u detaljima projekta, greske su samo u modalu */}
        {application && (
          <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl border-secondary border flex flex-col gap-4">
            <div>
              <span className="font-semibold text-primary">Project:</span> <span className="text-text font-bold">{application.projectTitle}</span>
            </div>
            <div>
              <span className="font-semibold text-primary">Proposal:</span> <span className="text-text">{application.proposal}</span>
            </div>
            <div>
              <span className="font-semibold text-primary">Status:</span> <span className="text-accent font-bold">{statusMap[application.applicationStatusId] || 'Unknown'}</span>
            </div>
            {/* Dugmad za akcije u zavisnosti od statusa */}
            {application.applicationStatusId === 1 && (
              <div className="flex gap-4 mt-4">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold"
                  onClick={() => handleStatusAction('accept')}
                >
                  Accept
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-semibold"
                  onClick={() => handleStatusAction('reject')}
                >
                  Reject
                </button>
              </div>
            )}
            {application.applicationStatusId === 2 && (
              <div className="flex gap-4 mt-4">
                <button
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 font-semibold"
                  onClick={() => handleStatusAction('cancel')}
                >
                  Cancel
                </button>
                <button
                  className="bg-accent text-white px-4 py-2 rounded hover:bg-accent/80 font-semibold"
                  onClick={() => handleStatusAction('complete')}
                >
                  Complete
                </button>
              </div>
            )}
            {freelancer && (
              <div className="mt-4 p-4 bg-background border border-secondary rounded-lg flex flex-col sm:flex-row gap-4 items-center">
                <img
                  src={freelancer.user?.profileImageUrl && freelancer.user.profileImageUrl.startsWith('/profile-images')
                    ? (import.meta.env.VITE_BACKEND_URL || 'https://localhost:7156') + freelancer.user.profileImageUrl
                    : (freelancer.user?.profileImageUrl || '/defaultprofile.jpg')}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border border-secondary"
                  onError={e => { e.currentTarget.src = '/defaultprofile.jpg'; }}
                />
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-bold text-primary">{freelancer.user?.fullName}</span>
                  <span className="text-accent">{freelancer.user?.email}</span>
                  <span className="text-text">Experience: <span className="font-semibold text-primary">{freelancer.freelancerProfile?.experianceLevel}</span></span>
                </div>
              </div>
            )}
          </div>
        )}
        {error && (
          <MessageModal
            message={error}
            onClose={handleModalClose}
            title="Error"
            type="error"
          />
        )}
      </div>
    </>
  );
};

export default ClientApplicationDetails;
