import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MessageModal from '../components/MessageModal';
import ReviewDisplay from '../components/ReviewDisplay';
import ClientInfoModal from '../components/ClientInfoModal';
import ratingIcon from '../assets/icons/rating.png';
import deleteIcon from '../assets/icons/delete.png';

const FreelancerApplicationDetails = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        // Get application
        const appRes = await fetch(`/api/Applications/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!appRes.ok) throw new Error('Failed to fetch application details');
        const appData = await appRes.json();
        setApplication(appData);
        // Get project
        const projRes = await fetch(`/api/Projects/${appData.projectId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (projRes.ok) {
          const projData = await projRes.json();
          setProject(projData);
          // Get client info
          if (projData.clientProfileId) {
            const clientRes = await fetch(`/api/Users/client-profile/${projData.clientProfileId}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (clientRes.ok) {
              const clientData = await clientRes.json();
              setClient(clientData);
            }
          }
        }
      } catch {
        setError('Could not load application details.');
      }
      setLoading(false);
    };
    fetchDetails();
  }, [id]);

  // Fetch review for this project by this freelancer
  useEffect(() => {
    if (!project) return;
    setReviewLoading(true);
    fetch(`/api/Reviews/by-project/${project.projectId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.ok ? res.json() : res.json().then(e => { throw e; }))
      .then(data => setReview(data))
      .catch(err => setReview(null))
      .finally(() => setReviewLoading(false));
  }, [project]);

  // Akcija za status dugmad
  const handleStatusAction = async (action) => {
    if (!application) return;
    let url = '';
    switch (action) {
      case 'withdraw':
        url = `/api/Applications/withdraw/${application.applicationId}`;
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
      setSuccess('Action successful!');
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setError('Action failed.');
    }
  };

  // Slanje review-a
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/Reviews/freelancer-to-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          projectId: project.projectId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to leave review.');
      }
      setShowReviewForm(false);
      setSuccess('Review submitted successfully!');
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setError(err.message || 'Failed to leave review.');
    }
  };

  // Brisanje review-a
  const handleDeleteReview = async () => {
    if (!review || !review.reviewId) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/Reviews/${review.reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Failed to delete review.');
      setSuccess('Review deleted successfully!');
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setError('Failed to delete review.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background px-4 py-8 flex flex-col items-center pt-27">
        <h1 className="text-3xl font-bold text-accent mb-4">Application Details</h1>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <MessageModal message={error} onClose={() => setError('')} title="Error" type="error" />}
        {application && project && (
          <>
            {project.projectStatus !== 'Finished' && (
              <div className="flex gap-4 mb-6 w-full max-w-2xl justify-end">
                {(project.projectStatus === 'Open' && application.applicationStatusId === 1) && (
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-semibold cursor-pointer"
                    onClick={() => handleStatusAction('withdraw')}
                  >
                    Withdraw
                  </button>
                )}
                {(project.projectStatus === 'Open' && application.applicationStatusId === 2) && (
                  <>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-semibold cursor-pointer"
                      onClick={() => handleStatusAction('withdraw')}
                    >
                      Withdraw
                    </button>
                    <button
                      className="bg-accent text-white px-4 py-2 rounded hover:bg-accent/80 font-semibold cursor-pointer"
                      onClick={() => handleStatusAction('complete')}
                    >
                      Complete
                    </button>
                  </>
                )}
              </div>
            )}
            <div className="bg-background rounded-lg shadow-md p-8 w-full max-w-2xl border-secondary border flex flex-col gap-4">
              <div className="text-2xl font-bold text-primary mb-2">{application.projectTitle}</div>
              <div className="text-text mb-2"><span className="font-semibold text-accent">Status:</span> {application.applicationStatus}</div>
              <div className="text-text mb-2"><span className="font-semibold text-accent">Proposal:</span> {application.proposal}</div>
              <div className="text-text mb-2"><span className="font-semibold text-accent">Project Description:</span> {project.description}</div>
              <div className="text-text mb-2"><span className="font-semibold text-accent">Budget:</span> ${project.budget}</div>
              <div className="text-text mb-2"><span className="font-semibold text-accent">Deadline:</span> {project.deadline}</div>
              <div className="text-text mb-2"><span className="font-semibold text-accent">Project Status:</span> {project.projectStatus}</div>
              {client && client.user && client.clientProfile && (
                <div className="mt-6 p-4 bg-background border border-accent rounded-lg flex flex-col sm:flex-row gap-4 items-center cursor-pointer hover:shadow-lg transition"
                  onClick={() => setShowClientModal(true)}
                  title="View client details"
                >
                  <img
                    src={client.user.profileImageUrl && client.user.profileImageUrl.startsWith('/profile-images')
                      ? (import.meta.env.VITE_BACKEND_URL || 'https://localhost:7156') + client.user.profileImageUrl
                      : (client.user.profileImageUrl || '/defaultprofile.jpg')}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border border-secondary"
                    onError={e => { e.currentTarget.src = '/defaultprofile.jpg'; }}
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-bold text-primary">{client.user.fullName}</span>
                    <span className="text-accent">{client.user.email}</span>
                    <span className="text-text">Job title: <span className="font-semibold text-primary">{client.clientProfile.jobTitle}</span></span>
                  </div>
                </div>
              )}
              {showClientModal && (
                <ClientInfoModal clientProfileId={client.clientProfile.clientProfileId} onClose={() => setShowClientModal(false)} />
              )}
              {reviewLoading ? (
                <div className="text-gray-500">Loading review...</div>
              ) : review && review.rating ? (
                <ReviewDisplay review={review} onDelete={handleDeleteReview} />
              ) : (
                <div className="mt-4 text-gray-500">You have not left a review for this project.</div>
              )}
              {/* Leave review dugme i forma */}
              {!review && !reviewLoading && application.applicationStatusId !== 1 && !showReviewForm && (
                <button
                  className="bg-accent text-white px-4 py-2 rounded hover:bg-accent/80 font-semibold mt-2 w-fit cursor-pointer"
                  onClick={() => setShowReviewForm(true)}
                >
                  Leave review
                </button>
              )}
              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="mt-4 flex flex-col gap-3 bg-background border border-accent rounded-lg p-4">
                  <label className="font-semibold text-primary">Rating:</label>
                  <div className="flex gap-2 mb-2">
                    {[1,2,3,4,5].map(num => (
                      <button
                        type="button"
                        key={num}
                        className={`text-2xl ${reviewRating >= num ? 'text-yellow-500' : 'text-gray-300'}`}
                        onClick={() => setReviewRating(num)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <label className="font-semibold text-primary">Comment:</label>
                  <textarea
                    className="border border-secondary rounded p-2 resize-none min-h-[60px]"
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    required
                    maxLength={500}
                    placeholder="Write your review..."
                  />
                  <div className="flex gap-3 mt-2">
                    <button
                      type="submit"
                      className="bg-accent text-white px-4 py-2 rounded hover:bg-accent/80 font-semibold cursor-pointer"
                    >
                      Submit Review
                    </button>
                    <button
                      type="button"
                      className="text-accent underline cursor-pointer"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default FreelancerApplicationDetails;
