'use client';

import { useState, useEffect } from 'react';
import { isFavorite, toggleFavorite } from '@/lib/favorites';

export default function FavoriteButton({ item, size = 'default' }) {
  const [isFav, setIsFav] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsFav(isFavorite(item.id));
  }, [item.id]);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAnimating(true);
    const newStatus = toggleFavorite(item);
    setIsFav(newStatus);

    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-12 h-12',
  };

  const iconSizes = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        rounded-full flex items-center justify-center
        transition-all duration-300
        ${isFav
          ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
          : 'bg-cream/10 text-cream/50 hover:bg-cream/20 hover:text-cream'
        }
        ${isAnimating ? 'scale-125' : 'scale-100'}
      `}
      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={`${iconSizes[size]} transition-transform ${isAnimating ? 'scale-110' : ''}`}
        fill={isFav ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
