import React, { useEffect, useState } from 'react';

const OrderDetailsModal = ({ order, onClose }) => {
  const [freelancer, setFreelancer] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const fetchServiceAndFreelancer = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch full service details using serviceId
        const serviceRes = await fetch(`/api/Services/${order.serviceId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (serviceRes.ok) {
          const serviceData = await serviceRes.json();
          console.log('SERVICE DETAILS RESPONSE:', serviceData); // DEBUG LOG
          setService(serviceData);

          // Always use freelancerProfileId from freelancer object
          const freelancerObj = serviceData.freelancer;
          if (freelancerObj && freelancerObj.freelancerProfileId) {
            const freelancerRes = await fetch(`/api/Users/user-freelancer-info?freelancerProfileId=${freelancerObj.freelancerProfileId}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (freelancerRes.ok) {
              const freelancerData = await freelancerRes.json();
              console.log('FREELANCER INFO RESPONSE:', freelancerData); // DEBUG LOG
              setFreelancer(freelancerData);
            }
          }
        }
      } catch {
        setError('Could not load order details.');
      }
      setLoading(false);
    };
    fetchServiceAndFreelancer();
  }, [order]);

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
          <span className="text-lg font-semibold text-text">{service?.title || 'Untitled Service'}</span>
          <span className="text-accent">{service?.description || ''}</span>
          <span className="text-accent font-bold">Price: ${service?.price}</span>
        </div>
        <div className="flex flex-col gap-1 mt-2 p-3 bg-background rounded border border-secondary">
          <span className="font-semibold text-primary">Freelancer info:</span>
          {loading && <span className="text-gray-500">Loading...</span>}
          {error && <span className="text-red-500">{error}</span>}
          {freelancer && (
            <>
              <div className="flex items-center gap-3 mb-2">
                {freelancer.user?.profileImageUrl ? (
                  <img
                    src={
                      freelancer.user.profileImageUrl.startsWith('/profile-images')
                        ? `${import.meta.env.VITE_BACKEND_URL || 'https://localhost:7156'}${freelancer.user.profileImageUrl}`
                        : freelancer.user.profileImageUrl
                    }
                    alt="Profile"
                    className="w-12 h-12 rounded-full border border-secondary object-cover"
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
                  <span className="text-accent">Name: <span className="font-semibold text-text">{freelancer.user?.fullName || 'N/A'}</span></span>
                  <span className="text-accent">Email: <span className="font-semibold text-text">{freelancer.user?.email || 'N/A'}</span></span>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <span className="font-semibold text-primary">Order status:</span>
          <span className="text-base font-semibold text-accent">{order.orderStatus?.status || 'Unknown'}</span>
        </div>
        {actionMessage && <div className="text-green-600 text-center font-semibold">{actionMessage}</div>}
        {actionError && <div className="text-red-500 text-center font-semibold">{actionError}</div>}
        <div className="flex gap-3 mt-4 justify-end">
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

export default OrderDetailsModal;
