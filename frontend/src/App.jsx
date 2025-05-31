import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ClientDashboard from './pages/ClientDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ChooseRole from './components/ChooseRole';
import RegisterClient from './pages/RegisterClient';
import RegisterFreelancer from './pages/RegisterFreelancer';
import ProtectedRoute from './components/ProtectedRoute'; // Import the new component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chooserole" element={<ChooseRole />} />
        {/* Protect client dashboard for 'Client' role */}
        <Route path="/clientdashboard" element={
          <ProtectedRoute requiredRole="Client">
            <ClientDashboard />
          </ProtectedRoute>
        } />
        {/* Protect freelancer dashboard for 'Freelancer' role */}
        <Route path="/freelancerdashboard" element={
          <ProtectedRoute requiredRole="Freelancer">
            <FreelancerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/registerclient" element={<RegisterClient />} />
        <Route path="/registerfreelancer" element={<RegisterFreelancer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
