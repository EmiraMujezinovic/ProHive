import React, { useState } from 'react';

const OrderServiceButton = ({ serviceId, onOrderSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleOrder = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/Orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(serviceId),
      });
      if (res.ok) {
        setMessage(
          'Order created successfully! Please wait for the freelancer to accept your placed order.'
        );
        setError(null);
        setShowModal(true);
        if (onOrderSuccess) onOrderSuccess();
      } else {
        const data = await res.json().catch(() => null);
        if (data && data.message === 'Order already placed for this service.') {
          setError('You have already placed an order for this service. You can view your orders in the My Orders tab.');
        } else {
          setError('An error occurred. Please try again.');
        }
        setMessage(null);
        setShowModal(true);
      }
    } catch {
      setError('An error occurred. Please try again.');
      setMessage(null);
      setShowModal(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-end w-full">
      <button
        className="bg-accent text-white px-5 py-2 rounded-lg shadow hover:bg-secondary hover:text-text transition font-semibold cursor-pointer hover:scale-103"
        onClick={handleOrder}
        disabled={loading}
      >
        {loading ? 'Ordering...' : 'Order Service'}
      </button>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-2 flex flex-col gap-4 border border-secondary relative animate-fadeIn">
            <button
              className="absolute top-2 right-3 text-accent hover:text-secondary text-3xl font-bold cursor-pointer"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            {message && (
              <div className="text-green-600 text-base text-center font-semibold p-5">{message}</div>
            )}
            {error && (
              <div className="text-red-500 text-base text-center font-semibold p-5">{error}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderServiceButton;
