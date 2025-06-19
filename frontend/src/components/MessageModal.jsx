import React from 'react';

/**
 * Generic modal for displaying a message with an OK button.
 * Props:
 * - message: string (message to display)
 * - onClose: function to call when closing modal
 * - title: optional string (modal title)
 * - type: optional string ('error' | 'success' | 'info') for styling
 */
const MessageModal = ({ message, onClose, title = 'Message', type = 'info' }) => {
  const color = type === 'error' ? 'text-red-600' : type === 'success' ? 'text-green-700' : 'text-primary';
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
        <h3 className={`text-xl font-bold mb-4 ${color}`}>{title}</h3>
        <p className="mb-6 text-text">{message}</p>
        <button
          className="bg-primary text-text px-6 py-2 rounded font-semibold hover:bg-secondary transition"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default MessageModal;
