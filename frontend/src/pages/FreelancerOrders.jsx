import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import FreelancerOrderDetailsModal from '../components/FreelancerOrderDetailsModal';

const FreelancerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState({}); // clientProfileId -> client info
  const [services, setServices] = useState({}); // serviceId -> service info
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userId, setUserId] = useState(null);
  const [myReviews, setMyReviews] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/Orders/freelancer-orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
        // Fetch client info for each unique clientProfileId
        const uniqueClientIds = [...new Set(data.map(o => o.clientProfileId).filter(Boolean))];
        const clientsObj = {};
        await Promise.all(uniqueClientIds.map(async (id) => {
          try {
            const res = await fetch(`/api/Users/client-profile/${id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (res.ok) {
              const clientData = await res.json();
              clientsObj[id] = clientData;
            }
          } catch {}
        }));
        setClients(clientsObj);
      } catch (err) {
        setError('Could not load orders.');
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.userId || payload.id);
    }
  }, []);

  // Fetch reviews left by freelancer
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/Reviews/reviewer/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setMyReviews(Array.isArray(data) ? data : []))
      .catch(() => setMyReviews([]));
  }, [userId]);

  // Helper: get review for a client (revieweeId = userId klijenta)
  const getReviewForClient = (clientUserId) => {
    return myReviews.find(r => r.revieweeId === clientUserId);
  };

  // Fetch service details on demand when modal opens
  const fetchService = async (serviceId) => {
    if (services[serviceId]) return services[serviceId];
    try {
      const res = await fetch(`/api/Services/${serviceId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setServices(prev => ({ ...prev, [serviceId]: data }));
        return data;
      }
    } catch {}
    return null;
  };

  const handleOrderClick = async (order) => {
    const service = await fetchService(order.serviceId);
    setSelectedOrder({ ...order, service });
  };

  const closeModal = () => setSelectedOrder(null);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background px-4 py-8 flex flex-col items-center pt-27">
        <h1 className="text-3xl font-bold text-accent mb-8 text-center">Your Orders</h1>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!loading && !error && orders.length === 0 && (
          <div className="text-gray-500">No orders found.</div>
        )}
        <div className="w-full max-w-3xl flex flex-col gap-4">
          {orders.map(order => {
            const client = clients[order.clientProfileId];
            return (
              <div
                key={order.orderId}
                className="bg-background rounded-lg shadow p-4 border border-primary flex flex-col gap-2 cursor-pointer hover:border-accent hover:bg-gray-100 transition hover:scale-102"
                onClick={() => handleOrderClick(order)}
              >
                <div className="flex flex-row items-center justify-between gap-2">
                  <span className="font-semibold text-text text-xl">{order.service?.title || 'Untitled Service'}</span>
                  <span className="text-accent font-bold text-right self-center text-lg">{order.orderStatus?.status || 'Unknown'}</span>
                </div>
                <span className="text-text"><span className='text-accent font-semibold'>Due date:</span> {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A'}</span>
                <span className="text-text"><span className='text-accent font-semibold'>Client:</span> {client ? (client.user?.fullName || 'N/A') : 'Loading...'}</span>
              </div>
            );
          })}
        </div>
        {selectedOrder && (
          <FreelancerOrderDetailsModal
            order={selectedOrder}
            client={clients[selectedOrder.clientProfileId]}
            service={selectedOrder.service}
            onClose={closeModal}
          />
        )}
      </div>
    </>
  );
};

export default FreelancerOrders;
