import React, { useEffect, useState } from 'react';

const EditService = ({ service, onClose }) => {
  const [form, setForm] = useState({
    title: service.Title || service.title || '',
    serviceCategoryId: service.ServiceCategoryId || service.serviceCategoryId || '',
    description: service.Description || service.description || '',
    price: service.Price || service.price || '',
    durationInDays: service.DurationInDays || service.durationInDays || '',
    tagIds: (service.Tags || service.tags || []).map(t => t.TagId || t.tagId),
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch categories
    fetch('/api/Services/categories', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
    // Fetch tags
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

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`/api/Services/${service.ServiceId || service.serviceId}`, {
        method: 'PUT',
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
      if (!res.ok) throw new Error('Failed to update service');
      setSuccess('Service updated successfully.');
      setTimeout(() => { setSuccess(''); onClose(); window.location.reload(); }, 1200);
    } catch (err) {
      setError('Failed to update service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-lg shadow-md p-8 mt-6 border border-secondary max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="text-3xl font-bold text-primary bg-background border-b-2 border-accent focus:outline-none focus:border-primary w-2/3"
          required
        />
        <button type="submit" className="bg-accent text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-secondary hover:text-text transition cursor-pointer ml-2" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      <div className="mb-4 text-md text-accent font-semibold">
        Category:
        <select
          name="serviceCategoryId"
          value={form.serviceCategoryId}
          onChange={handleChange}
          className="ml-2 px-3 py-2 border rounded bg-background text-text cursor-pointer"
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
      <div className="mb-4 flex flex-wrap gap-2">
        {tags.map(tag => (
          <label key={tag.TagId || tag.tagId} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.tagIds.includes(tag.TagId || tag.tagId)}
              onChange={() => handleTagToggle(tag.TagId || tag.tagId)}
              className="accent-primary size-4"
            />
            <span className="bg-accent/10 text-accent px-2 py-1 rounded-full text-[0.8rem] font-medium">{tag.Tag1 || tag.tag1}</span>
          </label>
        ))}
        {tags.length === 0 && <span className="text-gray-400 text-xs">No tags available</span>}
      </div>
      <div className="mb-5">
        <span className="font-semibold text-primary">Description:</span>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="mt-1 w-full whitespace-pre-line text-text border rounded px-3 py-2 bg-background"
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
            className="ml-2 px-2 py-1 border rounded w-18 bg-background text-text"
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
            className="ml-2 px-2 py-1 border rounded w-12 bg-background text-text"
            min="1"
            required
          />
          <span className='ml-1'>days</span>
        </div>
      </div>
      {success && <div className="text-green-600 font-semibold text-center mt-4">{success}</div>}
      {error && <div className="text-red-600 font-semibold text-center mt-4">{error}</div>}
    </form>
  );
};

export default EditService;
