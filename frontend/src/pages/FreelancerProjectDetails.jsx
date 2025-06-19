import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MessageModal from '../components/MessageModal';
import ProjectReviews from '../components/ProjectReviews';

const FreelancerProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApply, setShowApply] = useState(false);
  const [proposal, setProposal] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/Projects/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch project details');
        const data = await res.json();
        setProject(data);
        // Fetch client info
        if (data.clientProfileId) {
          const cres = await fetch(`/api/Users/client-profile/${data.clientProfileId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          if (cres.ok) {
            const cdata = await cres.json();
            setClient(cdata);
          }
        }
      } catch {
        setError('Could not load project details.');
      }
      setLoading(false);
    };
    fetchDetails();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/Applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ projectId: Number(id), proposal }),
      });
      if (!res.ok) throw new Error('Failed to apply to project.');
      setSuccess('Successfully applied to project!');
      setShowApply(false);
      setProposal('');
    } catch {
      setError('Failed to apply to project.');
    }
    setApplyLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background px-4 py-8 flex flex-col items-center pt-20">
        <h1 className="text-3xl font-bold text-primary mb-6">Project Details</h1>
        <div className="w-full max-w-2xl flex flex-row justify-end mb-4">
          <button
            className="bg-accent text-white px-5 py-2 rounded font-semibold hover:bg-accent/80 transition shadow-md"
            onClick={() => setShowApply(true)}
          >
            Apply to Project
          </button>
        </div>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && (
          <MessageModal message={error} onClose={() => setError('')} title="Error" type="error" />
        )}
        {success && (
          <MessageModal message={success} onClose={() => setSuccess('')} title="Success" type="success" />
        )}
        {project && (
          <>
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl border-secondary border flex flex-col gap-6">
              <div>
                <div className="text-2xl font-bold text-primary mb-2">{project.title}</div>
                <div className="text-text mb-2"><span className="font-semibold text-primary">Description:</span> {project.description}</div>
                <div className="text-text mb-2"><span className="font-semibold text-primary">Budget:</span> ${project.budget}</div>
                <div className="text-text mb-2"><span className="font-semibold text-primary">Deadline:</span> {project.deadline}</div>
                <div className="text-text mb-2"><span className="font-semibold text-primary">Status:</span> {project.projectStatus}</div>
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
              <div className="border-t border-secondary pt-6 mt-2">
                <ProjectReviews projectId={project.projectId} />
              </div>
            </div>
          </>
        )}
        {showApply && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <form
              onSubmit={handleApply}
              className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col gap-4 border border-secondary relative animate-fadeIn"
            >
              <button
                className="absolute top-2 right-3 text-accent hover:text-secondary text-3xl font-bold cursor-pointer"
                type="button"
                onClick={() => setShowApply(false)}
              >
                &times;
              </button>
              <h2 className="text-xl font-bold text-primary mb-2">Apply to Project</h2>
              <label className="font-semibold text-primary">Proposal:</label>
              <textarea
                className="border border-secondary rounded p-2 resize-none min-h-[80px]"
                value={proposal}
                onChange={e => setProposal(e.target.value)}
                required
                maxLength={500}
                placeholder="Write your proposal..."
              />
              <button
                type="submit"
                className="bg-accent text-white px-4 py-2 rounded hover:bg-accent/80 font-semibold mt-2 cursor-pointer"
                disabled={applyLoading}
              >
                {applyLoading ? 'Applying...' : 'Apply'}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default FreelancerProjectDetails;
