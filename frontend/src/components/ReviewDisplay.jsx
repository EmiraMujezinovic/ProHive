import React from 'react';
import ratingIcon from '../assets/icons/rating.png';
import deleteIcon from '../assets/icons/delete.png';

const ReviewDisplay = ({ review, onDelete }) => (
  <div className="mt-6 p-4 bg-background border border-accent rounded-lg flex flex-col gap-2">
    <div className="flex items-center gap-2 justify-between w-full">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-primary">Your Review:</span>
        <span className="flex items-center gap-1">
          {Array.from({ length: review.rating }).map((_, i) => (
            <img key={i} src={ratingIcon} alt="star" className="w-5 h-5 inline-block" />
          ))}
          <span className="text-gray-500 ml-1">({review.rating}/5)</span>
        </span>
      </div>
      {onDelete && (
        <button onClick={onDelete} title="Delete review">
          <img src={deleteIcon} alt="Delete" className="w-6 h-6 ml-2 hover:scale-110 transition" />
        </button>
      )}
    </div>
    <div className="text-text italic">{review.comment}</div>
  </div>
);

export default ReviewDisplay;
