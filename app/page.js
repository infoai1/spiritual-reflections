'use client';

import { useState, useEffect } from 'react';
import NewsCard from '@/components/NewsCard';

export default function HomePage() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/news?limit=12');
      const data = await response.json();

      if (data.success) {
        setNews(data.news);
      } else {
        setError(data.error || 'Failed to load news');
      }
    } catch (err) {
      setError('Failed to connect to news service');
      console.error('Error fetching news:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-8">
        <h1 className="text-3xl md:text-4xl font-bold heading-gold mb-4">
          Transform News into Spiritual Wisdom
        </h1>
        <p className="text-cream/70 max-w-2xl mx-auto leading-relaxed">
          Experience the world's news through the lens of <span className="text-gold">Tafakkur</span> (contemplation).
          Each article is interpreted in the spiritual style of Maulana Wahiduddin Khan,
          revealing divine lessons hidden within everyday events.
        </p>
      </section>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchNews}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-dark-card border border-gold/30 rounded-full text-gold hover:bg-gold/10 transition-all disabled:opacity-50"
        >
          <svg
            className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isLoading ? 'Loading...' : 'Refresh News'}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchNews}
            className="mt-2 text-sm text-gold hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="news-card rounded-xl overflow-hidden">
              <div className="h-48 bg-cream/5 loading-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-cream/10 rounded loading-pulse w-1/3" />
                <div className="h-5 bg-cream/10 rounded loading-pulse" />
                <div className="h-5 bg-cream/10 rounded loading-pulse w-4/5" />
                <div className="h-4 bg-cream/10 rounded loading-pulse w-full" />
                <div className="h-4 bg-cream/10 rounded loading-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* News Grid */}
      {!isLoading && news.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <NewsCard key={item.id} news={item} showSuitability={true} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && news.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-cream/50">No news available at the moment.</p>
          <button
            onClick={fetchNews}
            className="mt-4 text-gold hover:underline"
          >
            Try refreshing
          </button>
        </div>
      )}

      {/* About Section */}
      <section className="mt-16 pt-8 border-t border-gold/10">
        <div className="bg-dark-card rounded-xl p-8 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-gold mb-4">About This Project</h2>
          <div className="spiritual-text text-cream/80 space-y-4">
            <p>
              This application transforms everyday news into spiritual reflections,
              inspired by the teachings of <strong className="text-gold">Maulana Wahiduddin Khan</strong> (1925-2021),
              the renowned Islamic scholar and founder of CPS International.
            </p>
            <p>
              Maulana taught that spirituality comes through <em>Tafakkur</em> (deep contemplation) —
              seeing God's signs in every aspect of creation. Every event in the world,
              every scientific discovery, every human story contains divine wisdom waiting to be recognized.
            </p>
            <p>
              May these reflections fill your heart with gratitude (<em>Shukr</em>),
              awareness of the Hereafter (<em>Akhirat</em>), and recognition of God's boundless blessings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
