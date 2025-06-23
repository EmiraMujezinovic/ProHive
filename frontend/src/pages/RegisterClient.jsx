import React, { useState, useRef } from 'react';
import CommonRegisterFields from '../components/CommonRegisterFields';
import RegistrationSuccessModal from '../components/RegistrationSuccessModal';
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
      } else if (form.password.length < 7) {
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
    // Other fields
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

  // Handle input changes with live validation and username check
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    if (["username", "password", "email"].includes(name)) {
      setErrors(prev => ({ ...prev, ...validate(name, value) }));
    }
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
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-primary via-secondary to-background">
      <form onSubmit={handleSubmit} className="max-w-lg w-full mx-auto mt-10 mb-10 p-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register as Client</h2>
        {serverError && <div className="mb-4 text-red-600 text-center">{serverError}</div>}
        {/* Shared fields via CommonRegisterFields */}
        <CommonRegisterFields
          form={form}
          errors={errors}
          handleChange={handleChange}
          usernameAvailable={usernameAvailable}
          checkingUsername={checkingUsername}
        >
          {/* Client-specific fields */}
          <InputField label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} required />
          {errors.companyName && <div className="text-red-500 text-sm mb-2">{errors.companyName}</div>}
          <InputField label="Job Title" name="jobTitle" value={form.jobTitle} onChange={handleChange} required />
          {errors.jobTitle && <div className="text-red-500 text-sm mb-2">{errors.jobTitle}</div>}
          <InputField label="Description" name="description" value={form.description} onChange={handleChange} required />
          {errors.description && <div className="text-red-500 text-sm mb-2">{errors.description}</div>}
        </CommonRegisterFields>
        <button
          type="submit"
          disabled={loading || usernameAvailable === false || checkingUsername}
          className="w-full bg-primary text-text py-2 rounded font-semibold hover:bg-secondary transition mt-2 disabled:opacity-60 cursor-pointer hover:scale-101"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {/* Modal for success */}
      {showModal && (
        <RegistrationSuccessModal onClose={() => window.location.href = '/login'} />
      )}
    </div>
  );
};

export default RegisterClient;