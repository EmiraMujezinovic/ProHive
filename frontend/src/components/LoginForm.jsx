import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
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
        // Backend returns 'Invalid username or password.' for wrong credentials
        if (data && data.toLowerCase().includes('invalid username or password')) {
          setError('Invalid username or password.');
        } else {
          setError(data || 'Login failed.');
        }
        return;
      }
      const data = await response.json();
      localStorage.setItem('token', data.token);
      // Save user info and role in localStorage for later use
      localStorage.setItem('user', JSON.stringify({
        ...data.user,
        role: data.role
      }));
      if (data.role === 'Client') {
        navigate('/clientdashboard');
      } else if (data.role === 'Freelancer') {
        navigate('/freelancerdashboard');
      } else {
        setError('Unknown user role.');
        console.log('Unknown user role:', data.role);
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      {error && <div className="mb-2 text-red-600 text-center">{error}</div>}
      <div className="mb-4">
        <label className="block mb-1">Username</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Password</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="w-full bg-primary text-text py-2 rounded font-semibold hover:bg-secondary transition mb-2">Login</button>
      {/* <div className="text-center mt-2 text-sm">
        Don't have an account? <span className="text-primary cursor-pointer hover:underline">Sign up</span>
      </div> */}
      <div className="text-center mt-4">
        <a href="/signup" className="text-primary hover:underline">Don't have an account? Sign up</a>
      </div>
    </form>
  );
};

export default LoginForm;
