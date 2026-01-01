'use client';

import { useState, useEffect } from 'react';
import NewsCard from '@/components/NewsCard';

// Category UI configuration
const CATEGORY_UI = {
  inspiration: {
    icon: '💪',
    gradient: 'from-amber-500/10 to-orange-500/10',
    borderColor: 'border-amber-500/30',
    accentColor: 'text-amber-400'
  },
  science: {
    icon: '🔬',
    gradient: 'from-blue-500/10 to-purple-500/10',
    borderColor: 'border-blue-500/30',
    accentColor: 'text-blue-400'
  }
};

export default function HomePage() {
  const [categorizedNews, setCategorizedNews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/news?categorized=true&limit=12');
      const data = await response.json();

      if (data.success) {
        setCategorizedNews(data);
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
    <div className="space-y-12">
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
          <button onClick={fetchNews} className="mt-2 text-sm text-gold hover:underline">
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-12">
          {/* Loading skeleton for categories */}
          {['inspiration', 'science'].map((cat) => (
            <div key={cat} className="space-y-4">
              <div className="h-16 bg-cream/5 rounded-xl loading-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="news-card rounded-xl overflow-hidden">
                    <div className="h-48 bg-cream/5 loading-pulse" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-cream/10 rounded loading-pulse w-1/3" />
                      <div className="h-5 bg-cream/10 rounded loading-pulse" />
                      <div className="h-4 bg-cream/10 rounded loading-pulse w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categorized News */}
      {!isLoading && categorizedNews && (
        <>
          {/* Category Sections */}
          {Object.entries(categorizedNews.categories || {}).map(([categoryId, categoryData]) => {
            const articles = categoryData?.articles || [];
            const ui = CATEGORY_UI[categoryId] || {};

            if (articles.length === 0) return null;

            return (
              <section key={categoryId} className="space-y-6">
                {/* Category Header */}
                <div className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${ui.gradient} border ${ui.borderColor}`}>
                  <span className="text-3xl">{ui.icon || categoryData.icon}</span>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-cream">{categoryData.name}</h2>
                    <p className="text-sm text-cream/60">{categoryData.description}</p>
                  </div>
                  <span className="text-xs text-cream/40 bg-cream/10 px-3 py-1 rounded-full">
                    {articles.length} {articles.length === 1 ? 'story' : 'stories'}
                  </span>
                </div>

                {/* Category Articles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((item) => (
                    <NewsCard key={item.id} news={item} showSuitability={true} />
                  ))}
                </div>
              </section>
            );
          })}

          {/* Divider */}
          {categorizedNews.allNews && categorizedNews.allNews.length > 0 && (
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gold/20" />
              <span className="text-gold text-sm uppercase tracking-wide">All Spiritual Reflections</span>
              <div className="flex-1 h-px bg-gold/20" />
            </div>
          )}

          {/* All News Section */}
          {categorizedNews.allNews && categorizedNews.allNews.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">&#128240;</span>
                <h2 className="text-xl font-semibold text-cream">More Stories</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedNews.allNews.map((item) => (
                  <NewsCard key={item.id} news={item} showSuitability={true} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && (!categorizedNews || categorizedNews.totalCount === 0) && !error && (
        <div className="text-center py-12">
          <p className="text-cream/50">No news available at the moment.</p>
          <button onClick={fetchNews} className="mt-4 text-gold hover:underline">
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
