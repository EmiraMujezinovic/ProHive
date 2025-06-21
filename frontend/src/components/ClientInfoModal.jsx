import React, { useEffect, useState } from 'react';
import MessageModal from './MessageModal';

const ClientInfoModal = ({ clientProfileId, onClose }) => {
  const [clientData, setClientData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClientInfo = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch client profile and user info
        const res = await fetch(`/api/Users/client-profile/${clientProfileId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch client info');
        const data = await res.json();
        setClientData(data);
        // Fetch reviews for this client (by userId)
        const reviewsRes = await fetch(`/api/Reviews/reviewee/${data.user.userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!reviewsRes.ok) throw new Error('Failed to fetch client reviews');
        const reviewsData = await reviewsRes.json();
        // For each review, fetch reviewer full name
        const reviewsWithNames = await Promise.all(reviewsData.map(async (review) => {
          let reviewerName = '';
          try {
            const reviewerRes = await fetch(`/api/Users/${review.reviewerId}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (reviewerRes.ok) {
              const reviewerData = await reviewerRes.json();
              reviewerName = reviewerData.fullName || reviewerData.username || '';
            }
          } catch {}
          return { ...review, reviewerName };
        }));
        setReviews(reviewsWithNames);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (clientProfileId) fetchClientInfo();
  }, [clientProfileId]);

  if (!clientProfileId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative border-2 border-accent overflow-y-auto max-h-[90vh] min-h-[350px]">
        <button onClick={onClose} className="absolute top-3 right-3 text-accent text-3xl font-bold cursor-pointer">&times;</button>
        {loading ? (
          <div className="text-center text-gray-500">Loading client info...</div>
        ) : error ? (
          <MessageModal message={error} onClose={onClose} title="Error" type="error" />
        ) : clientData && clientData.user && clientData.clientProfile ? (
          <>
            <div className="flex flex-col items-center gap-3 mb-6">
              <img
                src={clientData.user.profileImageUrl && clientData.user.profileImageUrl.startsWith('/profile-images')
                  ? (import.meta.env.VITE_BACKEND_URL || 'https://localhost:7156') + clientData.user.profileImageUrl
                  : (clientData.user.profileImageUrl || '/defaultprofile.jpg')}
                alt="Profile"
                className="w-24 h-24 rounded-full border-2 border-accent object-cover shadow"
                onError={e => { e.currentTarget.src = '/defaultprofile.jpg'; }}
              />
              <div className="text-xl font-bold text-primary">{clientData.user.fullName}</div>
              <div className="text-accent font-semibold">@{clientData.user.username}</div>
              <div className="text-gray-700">{clientData.user.email}</div>
              <div className="text-gray-700">Phone: <span className="font-semibold text-primary">{clientData.user.phoneNumber}</span></div>
            </div>
            <div className="mb-4">
              <div className="font-semibold text-accent">Company:</div>
              <div className="text-gray-800 italic">{clientData.clientProfile.companyName}</div>
            </div>
            <div className="flex gap-4 mb-2">
              <div><span className="font-semibold text-accent">Job Title:</span> <span className="text-primary font-bold">{clientData.clientProfile.jobTitle}</span></div>
              <div><span className="font-semibold text-accent">Location:</span> <span className="text-primary font-bold">{clientData.clientProfile.location}</span></div>
            </div>
            <div className="mb-4">
              <div className="font-semibold text-accent">Description:</div>
              <div className="text-gray-800 italic">{clientData.clientProfile.description}</div>
            </div>
            <div className="mt-6">
              <div className="text-lg font-bold text-primary mb-2">Client Reviews</div>
              {reviews.length === 0 ? (
                <div className="text-gray-500 italic">No reviews for this client yet.</div>
              ) : (
                <div className="flex flex-col gap-4 max-h-60 overflow-y-auto pr-2">
                  {reviews.map((review) => (
                    <div key={review.reviewId} className="bg-background border border-accent rounded-lg p-3 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">{review.reviewerName}</span>
                        <span className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <span key={i} className="text-yellow-500 text-lg">★</span>
                          ))}
                          <span className="text-gray-500 ml-1">({review.rating}/5)</span>
                        </span>
                      </div>
                      <div className="text-text italic">{review.comment}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ClientInfoModal;
