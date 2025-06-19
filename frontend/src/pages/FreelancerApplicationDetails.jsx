import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MessageModal from '../components/MessageModal';

const FreelancerApplicationDetails = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background px-4 py-8 flex flex-col items-center pt-20">
        <h1 className="text-3xl font-bold text-primary mb-6">Application Details</h1>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <MessageModal message={error} onClose={() => setError('')} title="Error" type="error" />}
        {application && project && (
          <>
            {/* Dugmad za akcije - odmah ispod naslova */}
            {project.projectStatus !== 'Finished' && (
              <div className="flex gap-4 mb-6">
                {(project.projectStatus === 'Open' && application.applicationStatusId === 1) && (
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-semibold"
                    onClick={() => handleStatusAction('withdraw')}
                  >
                    Withdraw
                  </button>
                )}
                {(project.projectStatus === 'Open' && application.applicationStatusId === 2) && (
                  <>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-semibold"
                      onClick={() => handleStatusAction('withdraw')}
                    >
                      Withdraw
                    </button>
                    <button
                      className="bg-accent text-white px-4 py-2 rounded hover:bg-accent/80 font-semibold"
                      onClick={() => handleStatusAction('complete')}
                    >
                      Complete
                    </button>
                  </>
                )}
              </div>
            )}
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl border-secondary border flex flex-col gap-4">
              <div className="text-2xl font-bold text-primary mb-2">{application.projectTitle}</div>
              <div className="text-text mb-2"><span className="font-semibold text-primary">Status:</span> {application.applicationStatus}</div>
              <div className="text-text mb-2"><span className="font-semibold text-primary">Proposal:</span> {application.proposal}</div>
              <div className="text-text mb-2"><span className="font-semibold text-primary">Project Description:</span> {project.description}</div>
              <div className="text-text mb-2"><span className="font-semibold text-primary">Budget:</span> ${project.budget}</div>
              <div className="text-text mb-2"><span className="font-semibold text-primary">Deadline:</span> {project.deadline}</div>
              <div className="text-text mb-2"><span className="font-semibold text-primary">Project Status:</span> {project.projectStatus}</div>
              {client && client.user && client.clientProfile && (
                <div className="mt-6 p-4 bg-background border border-secondary rounded-lg flex flex-col sm:flex-row gap-4 items-center">
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
            </div>
          </>
        )}
        {success && (
          <MessageModal message={success} onClose={() => setSuccess('')} title="Success" type="success" />
        )}
      </div>
    </>
  );
};

export default FreelancerApplicationDetails;
