import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EditService from '../components/EditService';
import editIcon from '../assets/icons/edit.png';
import deleteIcon from '../assets/icons/delete.png';

const MyServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/Services/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch service details');
        const data = await res.json();
        console.log('Fetched service details:', data); // Debug log
        setService(data);
      } catch (err) {
        setError('Could not load service details.');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background px-4 py-8 flex flex-col items-center pt-20">
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {service && (
          <>
          <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl mt-8 border-secondary border relative">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-primary">{service.Title || service.title}</h1>
              <div className="flex gap-3">
                <button onClick={() => setShowEdit(v => !v)} title="Edit service">
                  <img src={editIcon} alt="Edit" className="w-6 h-6 hover:scale-110 transition cursor-pointer" />
                </button>
                <button onClick={() => setShowDeleteModal(true)} title="Delete service">
                  <img src={deleteIcon} alt="Delete" className="w-6 h-6 hover:scale-110 transition cursor-pointer ml-1" />
                </button>
              </div>
            </div>
            <div className="mb-4 text-lg text-accent font-semibold">
              Category: <span className="text-text font-normal">{service.Category || service.category}</span>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {(() => {
                // Robust tag extraction: handle Tags/tags, array of objects or strings
                const tagsArr = service.Tags || service.tags || [];
                if (tagsArr.length > 0) {
                  // If array of objects with Tag1/tag1, else fallback to string
                  return tagsArr.map((tag, idx) => {
                    if (typeof tag === 'string') return (
                      <span key={idx} className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-medium">{tag}</span>
                    );
                    return (
                      <span key={tag.TagId || tag.tagId || idx} className="bg-accent/15 text-accent px-2 py-1 rounded-full text-xs font-medium">
                        {tag.Tag1 || tag.tag1 || JSON.stringify(tag)}
                      </span>
                    );
                  });
                } else {
                  return <span className="text-gray-400 text-xs">No tags</span>;
                }
              })()}
            </div>
            <div className="mb-5">
              <span className="font-semibold text-primary">Description:</span>
              <div className="mt-1 whitespace-pre-line text-text">{service.Description || service.description}</div>
            </div>
            <div className="flex flex-wrap gap-8 mb-4">
              <div className="text-lg text-primary font-semibold">
                Price: <span className="text-accent font-bold">${service.Price || service.price}</span>
              </div>
              <div className="text-lg text-primary font-semibold">
                Duration: <span className="text-text font-bold">{service.DurationInDays || service.durationInDays} days</span>
              </div>
              <div className="text-lg text-primary font-semibold">
                Created: <span className="text-text font-bold">{service.CreatedAt ? (new Date(service.CreatedAt).toLocaleDateString()) : (service.createdAt ? (new Date(service.createdAt).toLocaleDateString()) : '')}</span>
              </div>
            </div>
          </div>
          {showEdit && <EditService service={service} onClose={() => setShowEdit(false)} />}
          {/* Delete confirmation modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
                <div className="text-lg font-semibold mb-4 text-center">Are you sure you want to delete this service?</div>
                <div className="flex gap-4 mt-2">
                  <button
                    className="px-5 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 cursor-pointer"
                    onClick={async () => {
                      setDeleteLoading(true);
                      setDeleteSuccess('');
                      try {
                        const res = await fetch(`/api/Services/${service.ServiceId || service.serviceId}`, {
                          method: 'DELETE',
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                          }
                        });
                        if (!res.ok) throw new Error('Failed to delete service');
                        setDeleteSuccess('Service deleted successfully.');
                        setTimeout(() => {
                          setShowDeleteModal(false);
                          window.location.href = '/freelancerservices';
                        }, 1200);
                      } catch (err) {
                        setDeleteSuccess('Failed to delete service.');
                      } finally {
                        setDeleteLoading(false);
                      }
                    }}
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
          </>
        )}
      </div>
    </>
  );
};

export default MyServiceDetails;
