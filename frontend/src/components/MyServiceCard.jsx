import React from 'react';
import ServiceReviews from './ServiceReviews';

/**
 * MyServiceCard component for displaying a freelancer's service.
 * Props:
 * - title: string
 * - price: number | string
 * - category: string
 * - tags: array of strings
 * - onClick: function (optional)
 * - serviceId: number (required for rating)
 */
const MyServiceCard = ({ title, price, category, tags, onClick, serviceId }) => {
  return (
    <div
      className="bg-background rounded-lg shadow-md p-6 flex flex-col gap-2 border border-accent hover:border-primary hover:bg-gray-100 hover:shadow-lg transition hover:scale-103 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-primary truncate" title={title}>{title}</h2>
        <span className="text-lg font-semibold text-accent">${price}</span>
      </div>
      <div className="text-sm text-text mb-1">
        <span className="font-medium text-accent">Category:</span> {category}
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        {tags && tags.length > 0 ? (
          tags.map((tag, idx) => (
            <span key={idx} className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-xs">No tags</span>
        )}
      </div>
      {/* Average rating prikaz */}
      <div className="mt-2">
        <ServiceReviews serviceId={serviceId} showOnlyAverage={true} />
      </div>
    </div>
  );
};

export default MyServiceCard;
