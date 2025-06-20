import React, { useState, useRef, useEffect } from 'react';
import CommonRegisterFields from '../components/CommonRegisterFields';
import RegistrationSuccessModal from '../components/RegistrationSuccessModal';

const EXPERIENCE_LEVELS = [
  'Beginner',
  'Junior',
  'Intermediate',
  'Senior',
  'Lead',
  'Expert',
];

const RegisterFreelancer = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    profileImage: null,
    experianceLevel: '',
    bio: '',
    location: '',
    skillIds: [],
  });
  const [skills, setSkills] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false); // Track if submit was attempted
  const usernameTimeout = useRef();

  useEffect(() => {
    fetch('/api/Skills')
      .then(res => res.json())
      .then(data => setSkills(data))
      .catch(() => setSkills([]));
  }, []);

  const validate = (field, value) => {
    let newErrors = {};
    if (!field || field === 'username') {
      if (!form.username) newErrors.username = '';
      else if (form.username.length < 3) newErrors.username = 'Username must be at least 3 characters.';
      else if (usernameAvailable === false) newErrors.username = 'Username is already taken.';
      else newErrors.username = '';
    }
    if (!field || field === 'password') {
      if (!form.password) newErrors.password = '';
      else if (form.password.length < 7) newErrors.password = 'Password must be at least 8 characters.';
      else newErrors.password = '';
    }
    if (!field || field === 'email') {
      if (!form.email) newErrors.email = '';
      else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Enter a valid email address.';
      else newErrors.email = '';
    }
    if (!field || field === 'fullName') {
      if (!form.fullName) newErrors.fullName = 'Full name is required.';
    }
    if (!field || field === 'phoneNumber') {
      if (!form.phoneNumber) newErrors.phoneNumber = 'Phone number is required.';
    }
    if (!field || field === 'experianceLevel') {
      if (!form.experianceLevel) newErrors.experianceLevel = 'Experience level is required.';
    }
    if (!field || field === 'bio') {
      if (!form.bio) newErrors.bio = 'Bio is required.';
    }
    if (!field || field === 'location') {
      if (!form.location) newErrors.location = 'Location is required.';
    }
    if (!field || field === 'skillIds') {
      if (triedSubmit && !form.skillIds.length) newErrors.skillIds = 'Select at least one skill.';
    }
    return newErrors;
  };

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

  const handleSkillToggle = (skillId) => {
    setForm(prev => {
      const selected = prev.skillIds.includes(skillId)
        ? prev.skillIds.filter(id => id !== skillId)
        : [...prev.skillIds, skillId];
      return { ...prev, skillIds: selected };
    });
    if (triedSubmit) setErrors(prev => ({ ...prev, ...validate('skillIds') }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setTriedSubmit(true);
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).filter(key => validationErrors[key] && validationErrors[key] !== '').length > 0 || usernameAvailable === false) return;
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'skillIds') {
          value.forEach(id => formData.append('SkillIds', id));
        } else if (value) {
          formData.append(key, value);
        }
      });
      const response = await fetch('/api/Auth/register/freelancer', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const msg = await response.text();
        setServerError(msg || 'Registration failed.');
      } else {
        setShowModal(true);
        setForm({
          username: '', password: '', email: '', fullName: '', phoneNumber: '',
          profileImage: null, experianceLevel: '', bio: '', location: '', skillIds: []
        });
        setTriedSubmit(false);
      }
    } catch (err) {
      setServerError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const isFormInvalid = () => {
    const validationErrors = validate();
    return (
      Object.keys(validationErrors).filter(key => validationErrors[key] && validationErrors[key] !== '').length > 0 ||
      usernameAvailable === false ||
      checkingUsername
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-primary via-secondary to-background">
      <form onSubmit={handleSubmit} className="max-w-lg w-full mx-auto mt-10 mb-10 p-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register as Freelancer</h2>
        {serverError && <div className="mb-4 text-red-600 text-center">{serverError}</div>}
        <CommonRegisterFields
          form={form}
          errors={errors}
          handleChange={handleChange}
          usernameAvailable={usernameAvailable}
          checkingUsername={checkingUsername}
        >
          <div className="mb-4">
            <label className="block mb-1">Experience Level</label>
            <select
              name="experianceLevel"
              value={form.experianceLevel}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.experianceLevel ? 'border-red-500' : ''}`}
              required
            >
              <option value="">Select experience level</option>
              {EXPERIENCE_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            {errors.experianceLevel && <div className="text-red-500 text-sm mt-1">{errors.experianceLevel}</div>}
          </div>
          <div className="mb-4">
            <label className="block mb-1">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.bio ? 'border-red-500' : ''}`}
              rows={3}
              required
            />
            {errors.bio && <div className="text-red-500 text-sm mt-1">{errors.bio}</div>}
          </div>
          <div className="mb-4">
            <label className="block mb-1">Skills</label>
            <div className="flex flex-wrap gap-4">
              {skills.map(skill => (
                <label key={skill.skillId} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.skillIds.includes(skill.skillId)}
                    onChange={() => handleSkillToggle(skill.skillId)}
                    className="accent-primary"
                  />
                  <span>{skill.skill1}</span>
                </label>
              ))}
            </div>
            {errors.skillIds && <div className="text-red-500 text-sm mt-1">{errors.skillIds}</div>}
          </div>
        </CommonRegisterFields>
        <button
          type="submit"
          disabled={isFormInvalid() || loading}
          className="w-full bg-primary text-text py-2 rounded font-semibold hover:bg-secondary transition mt-2 disabled:opacity-60 cursor-pointer hover:scale-101"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {showModal && (
        <RegistrationSuccessModal onClose={() => window.location.href = '/login'} />
      )}
    </div>
  );
};

export default RegisterFreelancer;