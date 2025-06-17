import React, { useEffect, useState } from 'react';

const FreelancerOrderDetailsModal = ({ order, client, service, onClose }) => {
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleAccept = async () => {
    setActionMessage(null);
    setActionError(null);
    try {
      const res = await fetch(`/api/Orders/accept/${order.orderId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        setActionMessage('Order accepted successfully.');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setActionError('Failed to accept order.');
      }
    } catch {
      setActionError('Failed to accept order.');
    }
  };

  const handleCancel = async () => {
    setActionMessage(null);
    setActionError(null);
    try {
      const res = await fetch(`/api/Orders/cancel/${order.orderId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        setActionMessage('Order cancelled successfully.');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setActionError('Failed to cancel order.');
      }
    } catch {
      setActionError('Failed to cancel order.');
    }
  };

  const handleComplete = async () => {
    setActionMessage(null);
    setActionError(null);
    try {
      const res = await fetch(`/api/Orders/complete/${order.orderId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        setActionMessage('Order marked as complete.');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setActionError('Failed to complete order.');
      }
    } catch {
      setActionError('Failed to complete order.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-2 flex flex-col gap-4 border border-secondary relative animate-fadeIn">
        <button
          className="absolute top-2 right-3 text-accent hover:text-secondary text-3xl font-bold cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-primary mb-2">Order Details</h2>
        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold text-text">{service?.title || 'Untitled Service'}</span>
          <span className="text-text/70">{service?.description || ''}</span>
          <span className="text-accent font-bold">Price: ${service?.price}</span>
        </div>
        <div className="flex flex-col gap-1 mt-2 p-3 bg-background rounded border border-secondary">
          <span className="font-semibold text-primary">Client info:</span>
          <div className="flex items-center gap-3 mb-2">
            {client?.user?.profileImageUrl ? (
              <img
                src={
                  client.user.profileImageUrl.startsWith('/profile-images')
                    ? `${import.meta.env.VITE_BACKEND_URL || 'https://localhost:7156'}${client.user.profileImageUrl}`
                    : client.user.profileImageUrl
                }
                alt="Profile"
                className="w-17 h-17 rounded-full border border-secondary object-cover"
                onError={e => { e.currentTarget.src = '/defaultprofile.jpg'; }}
              />
            ) : (
              <img
                src="/defaultprofile.jpg"
                alt="Profile"
                className="w-12 h-12 rounded-full border border-secondary object-cover"
              />
            )}
            <div className="flex flex-col">
              <span className="text-accent">Name: <span className="font-semibold text-text">{client?.user?.fullName || 'N/A'}</span></span>
              <span className="text-accent">Email: <span className="font-semibold text-text">{client?.user?.email || 'N/A'}</span></span>
              <span className="text-accent">Company: <span className="font-semibold text-text">{client?.clientProfile?.companyName || 'N/A'}</span></span>
              <span className="text-accent">Location: <span className="font-semibold text-text">{client?.clientProfile?.location || 'N/A'}</span></span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <span className="font-semibold text-primary">Order status:</span>
          <span className="text-base font-semibold text-accent">{order.orderStatus?.status || 'Unknown'}</span>
        </div>
        {actionMessage && <div className="text-green-600 text-center font-semibold">{actionMessage}</div>}
        {actionError && <div className="text-red-500 text-center font-semibold">{actionError}</div>}
        <div className="flex gap-3 mt-4 justify-end">
          {order.orderStatusId === 1 && (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold cursor-pointer"
              onClick={handleAccept}
              disabled={actionMessage}
            >
              Accept Order
            </button>
          )}
          {(order.orderStatusId === 1 || order.orderStatusId === 2) && (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-semibold cursor-pointer"
              onClick={handleCancel}
              disabled={actionMessage}
            >
              Cancel Order
            </button>
          )}
          {order.orderStatusId === 2 && (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold cursor-pointer"
              onClick={handleComplete}
              disabled={actionMessage}
            >
              Complete Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerOrderDetailsModal;
