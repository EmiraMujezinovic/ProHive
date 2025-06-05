import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

const AddServiceForm = () => {
  const [form, setForm] = useState({
    title: '',
    serviceCategoryId: '',
    description: '',
    price: '',
    durationInDays: '',
    tagIds: [],
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/Services/categories', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
    fetch('/api/Services/tags', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(setTags)
      .catch(() => setTags([]));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleTagToggle = tagId => {
    setForm(f => ({
      ...f,
      tagIds: f.tagIds.includes(tagId)
        ? f.tagIds.filter(id => id !== tagId)
        : [...f.tagIds, tagId]
    }));
  };

  const validate = () => {
    return (
      form.title.trim() &&
      form.serviceCategoryId &&
      form.description.trim() &&
      form.price &&
      form.durationInDays
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch('/api/Services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          Title: form.title,
          ServiceCategoryId: Number(form.serviceCategoryId),
          Description: form.description,
          Price: Number(form.price),
          DurationInDays: Number(form.durationInDays),
          TagIds: form.tagIds
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to add service.');
      }
      setSuccess('Service added successfully!');
      setForm({ title: '', serviceCategoryId: '', description: '', price: '', durationInDays: '', tagIds: [] });
      setTimeout(() => { setSuccess(''); window.location.href = '/freelancerservices'; }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to add service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-25 mb-10">
        <h1 className="text-2xl font-bold text-primary mb-4">Add New Service</h1>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-xl border border-secondary">
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-primary text-xl">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded bg-background"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-accent text-lg">Category</label>
            <select
              name="serviceCategoryId"
              value={form.serviceCategoryId}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded bg-background"
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.ServiceCategoryId || cat.serviceCategoryId} value={cat.ServiceCategoryId || cat.serviceCategoryId}>
                  {cat.Service || cat.service}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-accent text-lg">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <label key={tag.TagId || tag.tagId} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.tagIds.includes(tag.TagId || tag.tagId)}
                    onChange={() => handleTagToggle(tag.TagId || tag.tagId)}
                    className="accent-primary size-3"
                  />
                  <span className="bg-accent/10 text-accent px-2 py-1 rounded-full text-[0.9rem] font-medium">{tag.Tag1 || tag.tag1}</span>
                </label>
              ))}
              {tags.length === 0 && <span className="text-gray-400 text-xs">No tags available</span>}
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-primary text-lg">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded bg-background"
              rows={3}
              required
            />
          </div>
          <div className="flex flex-wrap gap-8 mb-4">
            <div className="text-lg text-primary font-semibold">
              Price: <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="ml-2 px-2 py-1 border rounded w-24 bg-background text-text"
                min="0"
                step="0.01"
                required
              />
              <span className='ml-1'>$</span>
            </div>
            <div className="text-lg text-primary font-semibold">
              Duration: <input
                type="number"
                name="durationInDays"
                value={form.durationInDays}
                onChange={handleChange}
                className="ml-2 px-2 py-1 border rounded w-20 bg-background text-text"
                min="1"
                required
              />
              <span className='ml-1'>days</span>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-accent text-white font-semibold py-2 rounded-lg shadow hover:bg-secondary hover:text-text transition cursor-pointer mt-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Service'}
          </button>
          {success && <div className="text-green-600 font-semibold text-center mt-4">{success}</div>}
          {error && <div className="text-red-600 font-semibold text-center mt-4">{error}</div>}
        </form>
      </div>
    </>
  );
};

export default AddServiceForm;
