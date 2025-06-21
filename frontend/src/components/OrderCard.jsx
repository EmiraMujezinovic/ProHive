import React from 'react';
import ratingIcon from '../assets/icons/rating.png';

const OrderCard = ({ order, review }) => {
  return (
    <div className="bg-secondary/40 rounded-lg shadow-md p-5 border border-secondary flex flex-row items-center justify-between w-full min-h-[80px]">
      <div className="flex flex-col gap-1 flex-1">
        <span className="text-xl font-bold text-text">{order.service?.title || 'Untitled Service'}</span>
        <span className="text-sm text-text">
          <span className="font-medium text-text/80">Due date:</span> {order.dueDate || 'N/A'}
        </span>
      </div>
      <div className="flex flex-col items-end h-full min-w-[120px]">
        <span className="text-base font-semibold text-green-600 flex items-center h-full">{order.orderStatus?.status || 'Unknown'}</span>
        <div className="mt-2">
          {review ? (
            <span className="inline-flex bg-accent/40 items-center gap-1 text-text font-bold text-sm p-1 rounded">
              <img src={ratingIcon} alt="Rating" className="w-4 h-4 inline-block" />
              {review.rating}/5
            </span>
          ) : (
            <span className="text-gray-600 text-sm">No rating left</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
