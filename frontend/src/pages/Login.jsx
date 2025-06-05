import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        const data = await response.text();
        if (data && data.toLowerCase().includes('invalid username or password')) {
          setError('Invalid username or password.');
        } else {
          setError(data || 'Login failed.');
        }
        return;
      }
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('role', data.role);
      if (data.role === 'Client') {
        navigate('/clientdashboard');
      } else if (data.role === 'Freelancer') {
        navigate('/freelancerdashboard');
      } else {
        setError('Unknown user role.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      {error && <div className="mb-2 text-red-600 text-center">{error}</div>}
      <InputField
        label="Username"
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
      />
      <InputField
        label="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="w-full bg-primary text-text py-2 rounded font-semibold hover:bg-secondary transition mb-2 cursor-pointer hover:scale-101">Login</button>
      <div className="text-center mt-4">
        <button
          type="button"
          className="text-primary hover:underline hover:text-accent bg-transparent border-none p-0 cursor-pointer"
          onClick={() => navigate('/chooserole')}
        >
          Don't have an account? Sign up
        </button>
      </div>
    </form>
  );
};

export default Login;
