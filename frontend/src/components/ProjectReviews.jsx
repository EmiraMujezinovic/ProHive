import React, { useEffect, useState } from 'react';
import ratingIcon from '../assets/icons/rating.png';

const ProjectReviews = ({ projectId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewers, setReviewers] = useState({});

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/Reviews/all-by-project/${projectId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : [data]);
        // Fetch reviewer info for each review
        const reviewerMap = {};
        await Promise.all(
          (Array.isArray(data) ? data : [data]).map(async (review) => {
            if (review.reviewerId) {
              const userRes = await fetch(`/api/Users/${review.reviewerId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              });
              if (userRes.ok) {
                const userData = await userRes.json();
                reviewerMap[review.reviewerId] = userData.fullName;
              }
            }
          })
        );
        setReviewers(reviewerMap);
      } catch {
        setError('Could not load reviews.');
      }
      setLoading(false);
    };
    if (projectId) fetchReviews();
  }, [projectId]);

  if (loading) return <div className="mt-6 text-gray-500">Loading reviews...</div>;
  if (error) return <div className="mt-6 text-red-500">{error}</div>;
  if (!reviews.length || (reviews.length === 1 && !reviews[0].reviewId)) return <div className="mt-6 text-gray-500">No reviews for this project.</div>;

  return (
    <div className="mt-2">
      <h2 className="text-xl font-bold text-primary mb-4">Project Reviews</h2>
      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <div key={review.reviewId} className="bg-background border border-accent rounded-lg p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text">{reviewers[review.reviewerId] || 'User'}:</span>
              <span className="flex items-center gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <img key={i} src={ratingIcon} alt="star" className="w-5 h-5 inline-block" />
                ))}
                <span className="text-gray-500 ml-1">({review.rating}/5)</span>
              </span>
            </div>
            <div className="text-text italic">{review.comment}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectReviews;
