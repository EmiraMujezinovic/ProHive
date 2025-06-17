import React, { useEffect, useState } from 'react';
import ratingIcon from '../assets/icons/rating.png';

const ServiceReviews = ({ serviceId }) => {
  const [averageRating, setAverageRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewers, setReviewers] = useState({}); // reviewerId -> user

  useEffect(() => {
    if (!serviceId) return;
    // Fetch average rating
    fetch(`/api/Reviews/average-rating/service/${serviceId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (typeof data === 'number') setAverageRating(data);
        else if (data && typeof data.averageRating === 'number') setAverageRating(data.averageRating);
        else setAverageRating(null);
      })
      .catch(() => setAverageRating(null));
    // Fetch all reviews
    fetch(`/api/Reviews/service/${serviceId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(async data => {
        setReviews(Array.isArray(data) ? data : []);
        // Fetch all unique reviewers
        const uniqueReviewerIds = [...new Set((data || []).map(r => r.reviewerId).filter(Boolean))];
        const reviewersObj = {};
        await Promise.all(uniqueReviewerIds.map(async (id) => {
          try {
            const res = await fetch(`/api/Users/${id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
              const user = await res.json();
              reviewersObj[id] = user;
            }
          } catch {}
        }));
        setReviewers(reviewersObj);
      })
      .catch(() => setReviews([]));
  }, [serviceId]);

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mt-2 mb-2">
        <img src={ratingIcon} alt="Rating" className="w-6 h-6" />
        <span className="text-lg text-accent font-semibold">{averageRating !== null ? `${averageRating}/5` : 'No rating'}</span>
      </div>
      <span className="font-semibold text-primary block mb-2">Reviews:</span>
      {reviews.length === 0 ? (
        <span className="text-gray-500">No reviews yet.</span>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => {
            const reviewer = reviewers[review.reviewerId];
            return (
              <div key={review.reviewId} className="bg-background border border-secondary rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <img src={ratingIcon} alt="Rating" className="w-5 h-5" />
                  <span className="text-base font-bold text-accent">{review.rating}/5</span>
                </div>
                <span className="text-text text-base flex-1 font-semibold">{review.comment}</span>
                <span className="text-gray-500">{reviewer ? reviewer.fullName : 'Loading...'}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceReviews;
