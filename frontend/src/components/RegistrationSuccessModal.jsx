import React from 'react';

/**
 * Modal shown after successful registration (used for both client and freelancer)
 * Props:
 * - onClose: function to call when closing modal (e.g. redirect to login)
 */
const RegistrationSuccessModal = ({ onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
      <h3 className="text-xl font-bold mb-4 text-green-700">Registration successful!</h3>
      <p className="mb-6">You can now log in to your account.</p>
      <button
        className="bg-primary text-text px-6 py-2 rounded font-semibold hover:bg-secondary transition"
        onClick={onClose}
      >
        Go to Login
      </button>
    </div>
  </div>
);

export default RegistrationSuccessModal;
