import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import editIcon from '../assets/icons/edit.png';
import deleteIcon from '../assets/icons/delete.png';
import MessageModal from '../components/MessageModal';
import ProjectReviews from '../components/ProjectReviews';

const ClientProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [editData, setEditData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/Projects/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch project details');
        const data = await res.json();
        setProject(data);
        setEditData({ ...data });
      } catch (err) {
        setError('Could not load project details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditSuccess('');
    setError('');
    try {
      const res = await fetch(`/api/Projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: editData.title,
          description: editData.description,
          budget: Number(editData.budget),
          deadline: editData.deadline,
          projectStatus: '' // uvijek šalji prazan string
        }),
      });
      if (res.ok) {
        setEditSuccess('Project updated successfully!');
        setShowEdit(false);
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setError('Failed to update project.');
      }
    } catch {
      setError('Failed to update project.');
    }
    setEditLoading(false);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteSuccess('');
    setError('');
    try {
      const res = await fetch(`/api/Projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setDeleteSuccess('Project deleted successfully.');
        setTimeout(() => navigate('/myprojects'), 1200);
      } else {
        const data = await res.json().catch(() => ({}));
        if (data && data.message && data.message.toLowerCase().includes('not allowed to delete')) {
          setError('You are not allowed to delete a finished project.');
          setShowErrorModal(true);
        } else {
          setError('Failed to delete project.');
        }
      }
    } catch {
      setError('Failed to delete project.');
    }
    setDeleteLoading(false);
  };

  // Funkcija za zatvaranje modala i refresh stranice
  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    setError('');
    window.location.reload();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background px-4 py-8 flex flex-col items-center pt-20">
        {loading && <div className="text-gray-500">Loading...</div>}
        {project && (
          <>
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl mt-8 border-secondary border relative flex flex-col gap-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-primary">{project.title}</h1>
                <div className="flex gap-3">
                  <button onClick={() => setShowEdit(v => !v)} title="Edit project">
                    <img src={editIcon} alt="Edit" className="w-6 h-6 hover:scale-110 transition cursor-pointer" />
                  </button>
                  <button onClick={() => setShowDeleteModal(true)} title="Delete project">
                    <img src={deleteIcon} alt="Delete" className="w-6 h-6 hover:scale-110 transition cursor-pointer ml-1" />
                  </button>
                </div>
              </div>
              <div className="mb-4 text-lg text-accent font-semibold">
                Budget: <span className="text-text font-normal">${project.budget}</span>
              </div>
              <div className="mb-4 text-lg text-accent font-semibold">
                Status: <span className="text-text font-normal">{project.projectStatus}</span>
              </div>
              <div className="mb-5">
                <span className="font-semibold text-primary">Description:</span>
                <div className="mt-1 whitespace-pre-line text-text">{project.description}</div>
              </div>
              <div className="mb-5">
                <span className="font-semibold text-primary">Deadline:</span>
                <div className="mt-1 text-text">{project.deadline}</div>
              </div>
              <div className="border-t border-secondary pt-6 mt-2">
                <ProjectReviews projectId={project.projectId} />
              </div>
            </div>
            {showEdit && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <form onSubmit={handleEditSubmit} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col gap-4 border border-secondary relative animate-fadeIn">
                  <button
                    className="absolute top-2 right-3 text-accent hover:text-secondary text-3xl font-bold cursor-pointer"
                    type="button"
                    onClick={() => setShowEdit(false)}
                  >
                    &times;
                  </button>
                  <h2 className="text-xl font-bold text-primary mb-2">Edit Project</h2>
                  <label className="font-semibold text-primary">Title:</label>
                  <input
                    type="text"
                    name="title"
                    className="border border-secondary rounded p-2"
                    value={editData.title}
                    onChange={handleEditChange}
                    required
                    maxLength={100}
                  />
                  <label className="font-semibold text-primary">Description:</label>
                  <textarea
                    name="description"
                    className="border border-secondary rounded p-2 resize-none min-h-[80px]"
                    value={editData.description}
                    onChange={handleEditChange}
                    required
                    maxLength={500}
                  />
                  <label className="font-semibold text-primary">Budget ($):</label>
                  <input
                    type="number"
                    name="budget"
                    className="border border-secondary rounded p-2"
                    value={editData.budget}
                    onChange={handleEditChange}
                    min={1}
                    required
                  />
                  <label className="font-semibold text-primary">Deadline:</label>
                  <input
                    type="date"
                    name="deadline"
                    className="border border-secondary rounded p-2"
                    value={editData.deadline}
                    onChange={handleEditChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {/* Ukloni polje za status */}
                  {editSuccess && <div className="text-green-600 text-center font-semibold">{editSuccess}</div>}
                  {error && <div className="text-red-500 text-center font-semibold">{error}</div>}
                  <button
                    type="submit"
                    className="bg-accent text-white px-4 py-2 rounded hover:bg-accent/80 font-semibold mt-2 cursor-pointer"
                    disabled={editLoading}
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
                  <div className="text-lg font-semibold mb-4 text-center">Are you sure you want to delete this project?</div>
                  <div className="flex gap-4 mt-2">
                    <button
                      className="px-5 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 cursor-pointer"
                      onClick={handleDelete}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? 'Deleting...' : 'Yes'}
                    </button>
                    <button
                      className="px-5 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 cursor-pointer"
                      onClick={() => setShowDeleteModal(false)}
                      disabled={deleteLoading}
                    >
                      Cancel
                    </button>
                  </div>
                  {deleteSuccess && <div className="mt-4 text-green-600 font-semibold text-center">{deleteSuccess}</div>}
                </div>
              </div>
            )}
            {showErrorModal && (
              <MessageModal
                message={error}
                onClose={handleErrorModalClose}
                title="Error"
                type="error"
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ClientProjectDetails;
