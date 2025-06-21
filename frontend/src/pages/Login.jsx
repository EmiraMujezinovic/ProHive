import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import logo from '../assets/images/logo.png';

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
        navigate('/clientservices');
      } else if (data.role === 'Freelancer') {
        navigate('/freelancerprojects');
      } else {
        setError('Unknown user role.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-primary via-secondary to-background">
      <form onSubmit={handleSubmit} className="max-w-sm w-full mx-auto p-8 bg-white rounded-2xl shadow-2xl border-2 border-accent/40 flex flex-col gap-2">
        <div className="flex items-center justify-center gap-3 mb-4 select-none">
          <img src={logo} alt="ProHive Logo" className="w-12 h-12 drop-shadow-lg" />
          <span className="text-4xl font-extrabold text-primary drop-shadow-md tracking-wide">Pro<span className="text-accent">Hive</span></span>
        </div>
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
        <button type="submit" className="w-full bg-primary text-text py-2 rounded font-semibold hover:bg-accent hover:text-white transition mb-2 cursor-pointer hover:scale-103">Login</button>
        <div className="text-center mt-4">
          <button
            type="button"
            className="text-primary hover:underline hover:text-accent hover:scale-103 transition bg-transparent border-none p-0 cursor-pointer"
            onClick={() => navigate('/chooserole')}
          >
            Don't have an account? Sign up
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
