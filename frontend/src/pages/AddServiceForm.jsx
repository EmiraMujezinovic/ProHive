import React from 'react';
import Navbar from '../components/Navbar';

const AddServiceForm = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-20">
        <h1 className="text-2xl font-bold text-primary mb-4">Add New Service</h1>
        <div className="bg-white p-8 rounded shadow-md w-full max-w-xl">
          <p className="text-gray-500">Service creation form coming soon...</p>
        </div>
      </div>
    </>
  );
};

export default AddServiceForm;
