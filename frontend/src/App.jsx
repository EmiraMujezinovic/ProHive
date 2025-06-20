import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ClientDashboard from './pages/ClientDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ChooseRole from './components/ChooseRole';
import RegisterClient from './pages/RegisterClient';
import RegisterFreelancer from './pages/RegisterFreelancer';
import ProtectedRoute from './components/ProtectedRoute'; // Import the new component
import FreelancerServices from './pages/FreelancerServices';
import AddServiceForm from './pages/AddServiceForm';
import MyServiceDetails from './pages/MyServiceDetails';
import ClientServices from './pages/ClientServices';
import ClientServiceDetails from './pages/ClientServiceDetails';
import ClientOrders from './pages/ClientOrders';
import FreelancerOrders from './pages/FreelancerOrders';
import ClientProjectsPage from './pages/ClientProjectsPage';
import AddProjectForm from './pages/AddProjectForm';
import ClientProjectDetails from './pages/ClientProjectDetails';
import ClientApplications from './pages/ClientApplications';
import ClientApplicationDetails from './pages/ClientApplicationDetails';
import FreelancerProjects from './pages/FreelancerProjects';
import FreelancerProjectDetails from './pages/FreelancerProjectDetails';
import FreelancerApplications from './pages/FreelancerApplications';
import FreelancerApplicationDetails from './pages/FreelancerApplicationDetails';
import UserProfile from './pages/UserProfile';

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
        <Route path="/freelancerservices" element={<FreelancerServices />} />
        <Route path="/addserviceform" element={<AddServiceForm />} />
        <Route path="/myservicedetails/:id" element={<MyServiceDetails />} />
        <Route path="/clientservices" element={
          <ProtectedRoute requiredRole="Client">
            <ClientServices />
          </ProtectedRoute>
        } />
        <Route path="/clientservicedetails/:id" element={
          <ProtectedRoute requiredRole="Client">
            <ClientServiceDetails />
          </ProtectedRoute>
        } />
        <Route path="/clientorders" element={<ClientOrders />} />
        <Route path="/freelancerorders" element={<FreelancerOrders />} />
        <Route path="/myprojects" element={
          <ProtectedRoute requiredRole="Client">
            <ClientProjectsPage />
          </ProtectedRoute>
        } />
        <Route path="/addprojectform" element={
          <ProtectedRoute requiredRole="Client">
            <AddProjectForm />
          </ProtectedRoute>
        } />
        <Route path="/clientprojectdetails/:id" element={
          <ProtectedRoute requiredRole="Client">
            <ClientProjectDetails />
          </ProtectedRoute>
        } />
        <Route path="/applications" element={
          <ProtectedRoute requiredRole="Client">
            <ClientApplications />
          </ProtectedRoute>
        } />
        <Route path="/clientapplicationdetails/:id" element={
          <ProtectedRoute requiredRole="Client">
            <ClientApplicationDetails />
          </ProtectedRoute>
        } />
        <Route path="/freelancerprojects" element={<FreelancerProjects />} />
        <Route path="/freelancerproject/:id" element={<FreelancerProjectDetails />} />
        <Route path="/freelancerapplications" element={<FreelancerApplications />} />
        <Route path="/freelancerapplication/:id" element={<FreelancerApplicationDetails />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
