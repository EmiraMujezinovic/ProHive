import React, { useEffect, useState } from 'react';
import ratingIcon from '../assets/icons/rating.png';
import deleteIcon from '../assets/icons/delete.png';

const FreelancerOrderDetailsModal = ({ order, client, service, onClose }) => {
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [clientAverageRating, setClientAverageRating] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    // Fetch average rating for client (reviewee)
    if (client?.user?.userId) {
      fetch(`/api/Reviews/average-rating/reviewee/${client.user.userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          if (typeof data === 'number') setClientAverageRating(data);
          else if (data && typeof data.averageRating === 'number') setClientAverageRating(data.averageRating);
          else setClientAverageRating(null);
        })
        .catch(() => setClientAverageRating(null));
    }

    // Get freelancer userId from JWT
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.userId || payload.id);
    }
  }, [client]);

  useEffect(() => {
    // Fetch review left by freelancer for this client
    if (!userId || !client?.user?.userId) return;
    fetch(`/api/Reviews/reviewer/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find(r => r.revieweeId === client.user.userId);
          setMyReview(found || null);
        } else {
          setMyReview(null);
        }
      })
      .catch(() => setMyReview(null));
  }, [userId, client]);

  const handleAccept = async () => {
    setActionMessage(null);
    setActionError(null);
    try {
      const res = await fetch(`/api/Orders/accept/${order.orderId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        setActionMessage('Order accepted successfully.');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setActionError('Failed to accept order.');
      }
    } catch {
      setActionError('Failed to accept order.');
    }
  };

  const handleCancel = async () => {
    setActionMessage(null);
    setActionError(null);
    try {
      const res = await fetch(`/api/Orders/cancel/${order.orderId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        setActionMessage('Order cancelled successfully.');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setActionError('Failed to cancel order.');
      }
    } catch {
      setActionError('Failed to cancel order.');
    }
  };

  const handleComplete = async () => {
    setActionMessage(null);
    setActionError(null);
    try {
      const res = await fetch(`/api/Orders/complete/${order.orderId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        setActionMessage('Order marked as complete.');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setActionError('Failed to complete order.');
      }
    } catch {
      setActionError('Failed to complete order.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-2 flex flex-col gap-4 border border-secondary relative animate-fadeIn max-h-[96vh] overflow-y-auto">
        <button
          className="absolute top-2 right-3 text-accent hover:text-secondary text-3xl font-bold cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-primary mb-2">Order Details</h2>
        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold text-text">{service?.title || 'Untitled Service'}</span>
          <span className="text-text/70">{service?.description || ''}</span>
          <span className="text-accent font-bold">Price: ${service?.price}</span>
        </div>
        <div className="flex flex-col gap-1 mt-2 p-3 bg-background rounded border border-secondary">
          <span className="font-semibold text-primary">Client info:</span>
          <div className="flex items-center gap-3 mb-2">
            {client?.user?.profileImageUrl ? (
              <img
                src={
                  client.user.profileImageUrl.startsWith('/profile-images')
                    ? `${import.meta.env.VITE_BACKEND_URL || 'https://localhost:7156'}${client.user.profileImageUrl}`
                    : client.user.profileImageUrl
                }
                alt="Profile"
                className="w-17 h-17 rounded-full border border-secondary object-cover"
                onError={e => { e.currentTarget.src = '/defaultprofile.jpg'; }}
              />
            ) : (
              <img
                src="/defaultprofile.jpg"
                alt="Profile"
                className="w-12 h-12 rounded-full border border-secondary object-cover"
              />
            )}
            <div className="flex flex-col">
              <span className="text-accent">Name: <span className="font-semibold text-text">{client?.user?.fullName || 'N/A'}</span></span>
              <span className="text-accent">Email: <span className="font-semibold text-text">{client?.user?.email || 'N/A'}</span></span>
              <span className="text-accent">Company: <span className="font-semibold text-text">{client?.clientProfile?.companyName || 'N/A'}</span></span>
              <span className="text-accent">Location: <span className="font-semibold text-text">{client?.clientProfile?.location || 'N/A'}</span></span>
              {/* Average rating for client */}
              <span className="flex items-center gap-2 mt-1">
                <img src={ratingIcon} alt="Rating" className="w-5 h-5" />
                <span className="text-base text-accent font-semibold">{clientAverageRating !== null ? `${clientAverageRating}/5` : 'No rating'}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <span className="font-semibold text-primary">Order status:</span>
          <span className="text-base font-semibold text-accent">{order.orderStatus?.status || 'Unknown'}</span>
        </div>
        {actionMessage && <div className="text-green-600 text-center font-semibold">{actionMessage}</div>}
        {actionError && <div className="text-red-500 text-center font-semibold">{actionError}</div>}
        <div className="flex flex-col gap-1 mt-2 p-3 bg-background rounded border border-secondary">
          <span className="font-semibold text-primary">Your review for this client:</span>
          {myReview ? (
            <div className="flex items-center bg-white border border-secondary rounded p-2 justify-between">
              <div className="flex items-center gap-2">
                <img src={ratingIcon} alt="Rating" className="w-5 h-5" />
                <span className="text-accent font-bold">{myReview.rating}/5</span>
                <span className="text-text ml-2">{myReview.comment}</span>
              </div>
              <button
                className="ml-2 p-1 rounded hover:bg-red-100 transition self-start cursor-pointer"
                title="Delete review"
                onClick={async (e) => {
                  e.stopPropagation();
                  setActionMessage(null);
                  setActionError(null);
                  try {
                    const res = await fetch(`/api/Reviews/${myReview.reviewId}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });
                    if (res.ok) {
                      setActionMessage('Review deleted successfully!');
                      setTimeout(() => window.location.reload(), 1200);
                    } else {
                      setActionError('Failed to delete review.');
                    }
                  } catch {
                    setActionError('Failed to delete review.');
                  }
                }}
              >
                <img src={deleteIcon} alt="Delete" className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <span className="text-gray-400">No review left</span>
              {!showReviewForm && (
                <button
                  className="bg-accent text-white px-4 py-2 rounded hover:bg-accent/80 font-semibold w-fit mt-2 cursor-pointer"
                  onClick={() => setShowReviewForm(true)}
                >
                  Leave Review
                </button>
              )}
              {showReviewForm && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSubmittingReview(true);
                  setActionMessage(null);
                  setActionError(null);
                  try {
                    const res = await fetch('/api/Reviews/freelancer-to-client', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                      },
                      body: JSON.stringify({
                        reviewerId: userId,
                        revieweeId: client.user.userId,
                        rating: reviewRating,
                        comment: reviewComment,
                      }),
                    });
                    if (res.ok) {
                      setActionMessage('Review submitted successfully!');
                      setShowReviewForm(false);
                      setTimeout(() => window.location.reload(), 1200);
                    } else {
                      setActionError('Failed to submit review.');
                    }
                  } catch {
                    setActionError('Failed to submit review.');
                  }
                  setSubmittingReview(false);
                }} className="flex flex-col gap-3 mt-2 bg-background border border-secondary rounded p-4">
                  <label className="font-semibold text-primary">Rating:</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(num => (
                      <button
                        type="button"
                        key={num}
                        className={`w-8 h-8 rounded-full border cursor-pointer flex items-center justify-center font-bold text-lg ${reviewRating === num ? 'bg-accent text-white border-accent' : 'bg-white text-accent border-secondary'} transition cursor-pointer`}
                        onClick={() => setReviewRating(num)}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <label className="font-semibold text-primary mt-2">Comment:</label>
                  <textarea
                    className="border border-secondary rounded p-2 resize-none min-h-[60px]"
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    maxLength={300}
                    required
                    placeholder="Write your feedback..."
                  />
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold mt-2 disabled:opacity-60 cursor-pointer"
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    className="text-accent underline mt-1 cursor-pointer"
                    onClick={() => setShowReviewForm(false)}
                    disabled={submittingReview}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </>
          )}
        </div>
        <div className="flex gap-3 mt-4 justify-end">
          {order.orderStatusId === 1 && (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold cursor-pointer"
              onClick={handleAccept}
              disabled={actionMessage}
            >
              Accept Order
            </button>
          )}
          {(order.orderStatusId === 1 || order.orderStatusId === 2) && (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-semibold cursor-pointer"
              onClick={handleCancel}
              disabled={actionMessage}
            >
              Cancel Order
            </button>
          )}
          {order.orderStatusId === 2 && (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold cursor-pointer"
              onClick={handleComplete}
              disabled={actionMessage}
            >
              Complete Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerOrderDetailsModal;
