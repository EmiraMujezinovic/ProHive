import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

const ClientProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/Projects/my', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch projects');
        const data = await res.json();
        setProjects(data);
      } catch {
        setError('Could not load your projects.');
      }
      setLoading(false);
    };
    fetchProjects();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background px-4 py-8 flex flex-col items-center pt-28">
        <h1 className="text-3xl font-bold text-primary mb-3">Your Projects</h1>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 w-full max-w-3xl">
          <div></div>
          <button
            className="bg-accent text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-secondary hover:text-text transition cursor-pointer sm:mb-0"
            onClick={() => window.location.href = '/addprojectform'}
          >
            Add Project
          </button>
        </div>
        <div className="w-full max-w-3xl flex flex-col gap-5">
          {projects.length === 0 && !loading && !error && (
            <div className="text-gray-400 text-center">You have no projects yet.</div>
          )}
          {projects.map(project => (
            <div
              key={project.projectId}
              className="bg-white rounded-lg shadow-md p-5 border border-secondary flex flex-col gap-2 cursor-pointer hover:bg-accent/5 transition hover:scale-102"
              onClick={() => window.location.href = `/clientprojectdetails/${project.projectId}`}
            >
              <span className="text-xl font-bold text-primary">{project.title}</span>
              <div className="flex flex-row gap-6 items-center">
                <span className="text-accent font-semibold"><span className='text-text'>Budget:</span> ${project.budget}</span>
                <span className="text-text font-semibold">Status: <span className="text-accent">{project.projectStatus}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ClientProjectsPage;
