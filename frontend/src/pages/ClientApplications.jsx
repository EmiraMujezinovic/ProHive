import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

const statusMap = {
  1: 'Pending',
  2: 'Accepted',
  3: 'Rejected',
  4: 'Withdrawn',
  5: 'Canceled',
  6: 'Completed',
};

const ClientApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectDeadlines, setProjectDeadlines] = useState({}); // projectId -> deadline

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/Applications/my-project-applications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch applications');
        const data = await res.json();
        setApplications(data);
        // Fetch deadlines for unique projects
        const uniqueProjectIds = [...new Set(data.map(app => app.projectId))];
        const deadlinesObj = {};
        await Promise.all(uniqueProjectIds.map(async (pid) => {
          try {
            const res = await fetch(`/api/Projects/${pid}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (res.ok) {
              const proj = await res.json();
              deadlinesObj[pid] = proj.deadline;
            }
          } catch {}
        }));
        setProjectDeadlines(deadlinesObj);
      } catch {
        setError('Could not load your applications.');
      }
      setLoading(false);
    };
    fetchApplications();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background px-4 py-8 flex flex-col items-center pt-25">
        <h1 className="text-3xl font-bold text-primary mb-6">Project Applications</h1>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="w-full max-w-3xl flex flex-col gap-5">
          {applications.length === 0 && !loading && !error && (
            <div className="text-gray-400 text-center">No applications found.</div>
          )}
          {applications.map(app => (
            <div
              key={app.applicationId}
              className="bg-white rounded-lg shadow-md p-5 border border-secondary flex flex-col gap-2 cursor-pointer hover:bg-accent/5 transition"
              onClick={() => window.location.href = `/clientapplicationdetails/${app.applicationId}`}
            >
              <span className="text-xl font-bold text-primary">{app.projectTitle}</span>
              <div className="flex flex-row gap-6 items-center">
                <span className="text-accent font-semibold">Deadline: {projectDeadlines[app.projectId] ? new Date(projectDeadlines[app.projectId]).toLocaleDateString() : 'Loading...'}</span>
                <span className="text-text font-semibold">Status: <span className="text-primary">{statusMap[app.applicationStatusId] || 'Unknown'}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ClientApplications;
