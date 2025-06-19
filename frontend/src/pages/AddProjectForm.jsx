import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const AddProjectForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!title || !description || !budget || !deadline) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/Projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title,
          description,
          budget: Number(budget),
          deadline,
          projectStatus: '' // šalje prazan string za ProjectStatus
        }),
      });
      if (res.ok) {
        setSuccess('Project created successfully!');
        setTimeout(() => navigate('/myprojects'), 1200);
      } else {
        setError('Failed to create project.');
      }
    } catch {
      setError('Failed to create project.');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background px-4 py-8 flex flex-col items-center pt-25">
        <h1 className="text-3xl font-bold text-primary mb-6">Add New Project</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 w-full max-w-lg flex flex-col gap-4 border border-secondary">
          <label className="font-semibold text-primary">Title:</label>
          <input
            type="text"
            className="border border-secondary rounded p-2"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            maxLength={100}
          />
          <label className="font-semibold text-primary">Description:</label>
          <textarea
            className="border border-secondary rounded p-2 resize-none min-h-[80px]"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            maxLength={500}
          />
          <label className="font-semibold text-primary">Budget ($):</label>
          <input
            type="number"
            className="border border-secondary rounded p-2"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            min={1}
            required
          />
          <label className="font-semibold text-primary">Deadline:</label>
          <input
            type="date"
            className="border border-secondary rounded p-2"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
          />
          {error && <div className="text-red-500 text-center font-semibold">{error}</div>}
          {success && <div className="text-green-600 text-center font-semibold">{success}</div>}
          <button
            type="submit"
            className="bg-accent text-white px-4 py-2 rounded hover:bg-accent/80 font-semibold mt-2 cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
          <button
            type="button"
            className="text-accent underline mt-1 cursor-pointer"
            onClick={() => navigate('/myprojects')}
            disabled={loading}
          >
            Cancel
          </button>
        </form>
      </div>
    </>
  );
};

export default AddProjectForm;
