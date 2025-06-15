import React from 'react';

const OrderCard = ({ order }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 border border-secondary flex flex-row items-center justify-between w-full min-h-[80px]">
      <div className="flex flex-col gap-1">
        <span className="text-xl font-bold text-text">{order.service?.title || 'Untitled Service'}</span>
        <span className="text-sm text-text">
          <span className="font-medium text-accent">Due date:</span> {order.dueDate || 'N/A'}
        </span>
      </div>
      <div className="flex items-center h-full">
        <span className="text-base font-semibold text-accent flex items-center h-full">{order.orderStatus?.status || 'Unknown'}</span>
      </div>
    </div>
  );
};

export default OrderCard;
