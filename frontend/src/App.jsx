import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ClientDashboard from './pages/ClientDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ChooseRole from './components/ChooseRole';
import RegisterClient from './pages/RegisterClient';
import RegisterFreelancer from './pages/RegisterFreelancer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chooserole" element={<ChooseRole />} />
        <Route path="/clientdashboard" element={<ClientDashboard />} />
        <Route path="/freelancerdashboard" element={<FreelancerDashboard />} />
        <Route path="/registerclient" element={<RegisterClient />} />
        <Route path="/registerfreelancer" element={<RegisterFreelancer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
