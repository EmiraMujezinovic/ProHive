import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const statusColors = {
  Pending: 'text-yellow-600',
  Accepted: 'text-green-600',
  Rejected: 'text-red-600',
  Withdrawn: 'text-gray-500',
  Canceled: 'text-gray-500',
  Completed: 'text-accent',
};

const FreelancerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [deadlines, setDeadlines] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/Applications/my-applications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch applications');
        const data = await res.json();
        setApplications(data);
        // Fetch deadlines for all projects
        const deadlinesObj = {};
        await Promise.all(
          data.map(async (app) => {
            const pres = await fetch(`/api/Projects/${app.projectId}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (pres.ok) {
              const pdata = await pres.json();
              deadlinesObj[app.applicationId] = pdata.deadline;
            }
          })
        );
        setDeadlines(deadlinesObj);
      } catch {
        setError('Could not load applications.');
      }
      setLoading(false);
    };
    fetchApplications();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background px-4 py-8 flex flex-col items-center pt-25">
        <h1 className="text-3xl font-bold text-primary mb-6">Your Applications</h1>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="w-full max-w-3xl flex flex-col gap-4">
          {applications.length === 0 && !loading && !error && (
            <div className="text-gray-500 text-center">No applications found.</div>
          )}
          {applications.map(app => (
            <div
              key={app.applicationId}
              className="bg-white rounded-lg shadow-md p-6 border border-secondary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 cursor-pointer hover:bg-gray-50 transition hover:scale-102"
              onClick={() => navigate(`/freelancerapplication/${app.applicationId}`)}
            >
              <div>
                <div className="text-xl font-bold text-primary">{app.projectTitle}</div>
                <div className="text-text mt-1">Deadline: <span className="font-semibold text-accent">{deadlines[app.applicationId] || '-'}</span></div>
              </div>
              <div className={`text-lg mt-2 sm:mt-0 font-semibold ${statusColors[app.applicationStatus] || 'text-gray-700'}`}>{app.applicationStatus}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FreelancerApplications;
