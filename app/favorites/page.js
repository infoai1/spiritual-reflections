'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFavorites, clearFavorites } from '@/lib/favorites';
import FavoriteButton from '@/components/FavoriteButton';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
    setIsLoaded(true);
  }, []);

  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all favorites?')) {
      clearFavorites();
      setFavorites([]);
    }
  };

  const refreshFavorites = () => {
    setFavorites(getFavorites());
  };

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-cream/10 rounded w-1/3" />
          <div className="h-32 bg-cream/10 rounded" />
          <div className="h-32 bg-cream/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold heading-gold">Saved Reflections</h1>
          <p className="text-cream/60 mt-1">
            {favorites.length} {favorites.length === 1 ? 'reflection' : 'reflections'} saved
          </p>
        </div>
        {favorites.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Empty State */}
      {favorites.length === 0 && (
        <div className="text-center py-16 bg-dark-card rounded-xl">
          <div className="text-6xl mb-4">&#9825;</div>
          <h2 className="text-xl text-cream/70 mb-2">No favorites yet</h2>
          <p className="text-cream/50 mb-6">
            Save spiritual reflections that resonate with you
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold/20 text-gold rounded-full hover:bg-gold/30 transition-colors"
          >
            Explore News
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* Favorites List */}
      {favorites.length > 0 && (
        <div className="space-y-6">
          {favorites.map((item) => (
            <article
              key={item.id}
              className="bg-dark-card rounded-xl overflow-hidden border border-gold/10 hover:border-gold/20 transition-colors"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                {item.urlToImage && (
                  <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                    <img
                      src={item.urlToImage}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Source and Date */}
                      <div className="flex items-center gap-2 text-xs text-cream/50 mb-2">
                        <span className="text-gold">{item.source}</span>
                        {item.savedAt && (
                          <>
                            <span>•</span>
                            <span>
                              Saved {new Date(item.savedAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-cream mb-3">
                        {item.title}
                      </h3>

                      {/* Interpretation Preview */}
                      {item.interpretation && (
                        <p className="spiritual-text text-sm text-cream/70 line-clamp-3 mb-4">
                          {item.interpretation.substring(0, 200)}...
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/news/${encodeURIComponent(item.id)}`}
                          className="text-sm text-gold hover:underline"
                        >
                          Read full reflection →
                        </Link>
                      </div>
                    </div>

                    {/* Favorite Button */}
                    <div onClick={refreshFavorites}>
                      <FavoriteButton item={item} size="small" />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Wisdom Quote */}
      <div className="mt-12 p-6 bg-dark-card/30 rounded-xl border border-gold/10 text-center">
        <p className="spiritual-text text-cream/70 italic">
          "The remembrance of Allah brings peace to the heart."
        </p>
        <p className="text-gold text-sm mt-2">— Based on Quran 13:28</p>
      </div>
    </div>
  );
}
