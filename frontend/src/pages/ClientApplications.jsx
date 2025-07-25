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
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background px-4 py-8 flex flex-col items-center pt-27">
        <h1 className="text-3xl font-bold text-accent mb-10">Project Applications</h1>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {applications.length === 0 && !loading && !error && (
            <div className="text-gray-400 text-center col-span-full">No applications found.</div>
          )}
          {applications.map(app => (
            <div
              key={app.applicationId}
              className="bg-background rounded-lg shadow-md p-5 border border-accent hover:border-primary flex flex-col gap-2 cursor-pointer hover:bg-gray-100 transition hover:scale-102"
              onClick={() => window.location.href = `/clientapplicationdetails/${app.applicationId}`}
            >
              <span className="text-xl font-bold text-text">{app.projectTitle}</span>
              <div className="flex flex-row gap-6 items-center flex-wrap">
                <span className="text-accent font-semibold"><span className='text-text'>Deadline:</span> {projectDeadlines[app.projectId] ? new Date(projectDeadlines[app.projectId]).toLocaleDateString() : 'Loading...'}</span>
                <span className="text-text font-semibold">Status: <span className="text-accent">{statusMap[app.applicationStatusId] || 'Unknown'}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ClientApplications;
