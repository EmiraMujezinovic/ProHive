import React, { useState, useRef } from 'react';
import InputField from '../components/InputField';

const RegisterClient = () => {
  // State for all form fields
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    companyName: '',
    jobTitle: '',
    description: '',
    location: '',
    profileImage: null
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null); // null, true, false
  const [checkingUsername, setCheckingUsername] = useState(false);
  const usernameTimeout = useRef();

  // Validation helpers
  const validate = (field, value) => {
    let newErrors = {};
    // Username
    if (!field || field === 'username') {
      if (!form.username) {
        newErrors.username = '';
      } else if (form.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters.';
      } else if (usernameAvailable === false) {
        newErrors.username = 'Username is already taken.';
      } else {
        newErrors.username = '';
      }
    }
    // Password
    if (!field || field === 'password') {
      if (!form.password) {
        newErrors.password = '';
      } else if (form.password.length < 7) { // ispravljeno sa <= na <
        newErrors.password = 'Password must be at least 8 characters.';
      } else {
        newErrors.password = '';
      }
    }
    // Email
    if (!field || field === 'email') {
      if (!form.email) {
        newErrors.email = '';
      } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
        newErrors.email = 'Enter a valid email address.';
      } else {
        newErrors.email = '';
      }
    }
    // Ostala polja
    if (!field || field === 'fullName') {
      if (!form.fullName) newErrors.fullName = 'Full name is required.';
    }
    if (!field || field === 'phoneNumber') {
      if (!form.phoneNumber) newErrors.phoneNumber = 'Phone number is required.';
    }
    if (!field || field === 'companyName') {
      if (!form.companyName) newErrors.companyName = 'Company name is required.';
    }
    if (!field || field === 'jobTitle') {
      if (!form.jobTitle) newErrors.jobTitle = 'Job title is required.';
    }
    if (!field || field === 'description') {
      if (!form.description) newErrors.description = 'Description is required.';
    }
    if (!field || field === 'location') {
      if (!form.location) newErrors.location = 'Location is required.';
    }
    return newErrors;
  };

  // Handle input changes with live validation
  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    // Live validation for username, password, email
    if (["username", "password", "email"].includes(name)) {
      setErrors(prev => ({ ...prev, ...validate(name, value) }));
    }
    // Username availability check (debounced)
    if (name === 'username') {
      setUsernameAvailable(null);
      if (usernameTimeout.current) clearTimeout(usernameTimeout.current);
      if (value.length >= 3) {
        setCheckingUsername(true);
        usernameTimeout.current = setTimeout(async () => {
          try {
            const res = await fetch(`/api/Users/check-username?username=${encodeURIComponent(value)}`);
            const data = await res.json();
            setUsernameAvailable(!data.exists);
            setErrors(prev => ({ ...prev, ...validate('username', value) }));
          } catch (err) {
            setUsernameAvailable(null);
          } finally {
            setCheckingUsername(false);
          }
        }, 600);
      }
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).filter(key => validationErrors[key] && validationErrors[key] !== '').length > 0 || usernameAvailable === false) return;
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      const response = await fetch('/api/Auth/register/client', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const msg = await response.text();
        setServerError(msg || 'Registration failed.');
        console.error('Registration error:', msg);
      } else {
        setShowModal(true);
        setForm({
          username: '', password: '', email: '', fullName: '', phoneNumber: '',
          companyName: '', jobTitle: '', description: '', location: '', profileImage: null
        });
      }
    } catch (err) {
      setServerError('Network error.');
      console.error('Network error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-10 p-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register as Client</h2>
        {serverError && <div className="mb-4 text-red-600 text-center">{serverError}</div>}
        <div className="mb-4">
          <label className="block mb-1">Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded ${form.username && (errors.username || usernameAvailable === false) ? 'border-red-500' : form.username && usernameAvailable === true && !errors.username ? 'border-green-500' : ''}`}
            required
            autoComplete="off"
          />
          {/* Prikaz dostupnosti username-a */}
          {form.username && usernameAvailable === true && !errors.username && (
            <div className="text-green-600 text-xs mt-1">Username is available.</div>
          )}
          {form.username && usernameAvailable === false && (
            <div className="text-red-500 text-xs mt-1">Username is already taken.</div>
          )}
          {form.username && errors.username && errors.username !== '' && errors.username !== 'Username is already taken.' && (
            <div className="text-red-500 text-sm mt-1">{errors.username}</div>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded ${form.password && errors.password ? 'border-red-500' : form.password && !errors.password ? 'border-green-500' : ''}`}
            required
          />
          {form.password && errors.password && errors.password !== '' && (
            <div className="text-red-500 text-sm mt-1">{errors.password}</div>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded ${form.email && errors.email ? 'border-red-500' : form.email && !errors.email ? 'border-green-500' : ''}`}
            required
          />
          {form.email && errors.email && errors.email !== '' && (
            <div className="text-red-500 text-sm mt-1">{errors.email}</div>
          )}
        </div>
        <InputField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required />
        {errors.fullName && <div className="text-red-500 text-sm mb-2">{errors.fullName}</div>}
        <InputField label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
        {errors.phoneNumber && <div className="text-red-500 text-sm mb-2">{errors.phoneNumber}</div>}
        <InputField label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} required />
        {errors.companyName && <div className="text-red-500 text-sm mb-2">{errors.companyName}</div>}
        <InputField label="Job Title" name="jobTitle" value={form.jobTitle} onChange={handleChange} required />
        {errors.jobTitle && <div className="text-red-500 text-sm mb-2">{errors.jobTitle}</div>}
        <InputField label="Description" name="description" value={form.description} onChange={handleChange} required />
        {errors.description && <div className="text-red-500 text-sm mb-2">{errors.description}</div>}
        <InputField label="Location" name="location" value={form.location} onChange={handleChange} required />
        {errors.location && <div className="text-red-500 text-sm mb-2">{errors.location}</div>}
        <div className="mb-4">
          <label className="block mb-1">Profile Image (optional)</label>
          <input
            type="file"
            name="profileImage"
            accept="image/*"
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading || usernameAvailable === false || checkingUsername}
          className="w-full bg-primary text-text py-2 rounded font-semibold hover:bg-secondary transition mt-2 disabled:opacity-60"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {/* Modal for success */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-4 text-green-700">Registration successful!</h3>
            <p className="mb-6">You can now log in to your account.</p>
            <button
              className="bg-primary text-text px-6 py-2 rounded font-semibold hover:bg-secondary transition"
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RegisterClient;