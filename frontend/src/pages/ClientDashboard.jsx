import Navbar from '../components/Navbar';

const ClientDashboard = () => {
  return (
    <>
      <Navbar />
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold">Client Dashboard</h1>
        <p>Dobrodošli na klijentski dashboard!</p>
      </div>
    </>
  );
};

export default ClientDashboard;
