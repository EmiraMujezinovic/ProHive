import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import OrderCard from '../components/OrderCard';
import OrderDetailsModal from '../components/OrderDetailsModal';

const ClientOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userId, setUserId] = useState(null);
  const [myReviews, setMyReviews] = useState([]);

  // Get userId from JWT
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.userId || payload.id);
    }
  }, []);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/Orders/clientOrders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      } catch {
        setError('Could not load your orders. Please try again.');
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  // Fetch my reviews
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/Reviews/reviewer/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setMyReviews(Array.isArray(data) ? data : []))
      .catch(() => setMyReviews([]));
  }, [userId]);

  // Helper: get review for a serviceId
  const getReviewForService = (serviceId) => {
    return myReviews.find(r => r.serviceId === serviceId);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background px-4 py-8 flex flex-col items-center pt-25">
        <h1 className="text-3xl font-bold text-primary mb-6">Your Orders</h1>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="w-full max-w-3xl flex flex-col gap-5">
          {orders.length === 0 && !loading && !error && (
            <div className="text-gray-400 text-center">You have no orders yet.</div>
          )}
          {orders.map(order => {
            const review = getReviewForService(order.serviceId);
            return (
              <div key={order.orderId} onClick={() => setSelectedOrder(order)} className="cursor-pointer hover:scale-102 transition-transform">
                <OrderCard order={order} review={review} />
              </div>
            );
          })}
        </div>
        {selectedOrder && (
          <OrderDetailsModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
            review={getReviewForService(selectedOrder.serviceId)}
            userId={userId}
            refreshOrders={() => window.location.reload()}
          />
        )}
      </div>
    </>
  );
};

export default ClientOrders;
