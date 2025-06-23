import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const FreelancerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/Projects/all', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch projects');
        const data = await res.json();
        setProjects(data);
      } catch {
        setError('Could not load projects.');
      }
      setLoading(false);
    };
    fetchProjects();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background px-4 py-8 flex flex-col items-center pt-27">
        <h1 className="text-3xl font-bold text-accent mb-8">All Projects</h1>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="w-full max-w-3xl flex flex-col gap-4">
          {projects.length === 0 && !loading && !error && (
            <div className="text-gray-500 text-center">No projects found.</div>
          )}
          {projects.map(project => (
            <div
              key={project.projectId}
              className="bg-background rounded-lg shadow-md p-6 border border-accent hover:border-primary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 cursor-pointer hover:bg-gray-100 transition hover:scale-102"
              onClick={() => navigate(`/freelancerproject/${project.projectId}`)}
            >
              <div>
                <div className="text-xl font-bold text-text">{project.title}</div>
                <div className="text-text mt-1">Deadline: <span className="font-semibold text-accent">{project.deadline}</span></div>
                <div className="text-text">Budget: <span className="font-semibold text-accent">${project.budget}</span></div>
              </div>
              <div className="text-lg text-gray-500 mt-2 sm:mt-0">Status: <span className="font-semibold text-accent">{project.projectStatus}</span></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FreelancerProjects;
