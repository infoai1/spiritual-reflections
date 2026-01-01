'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function NewsCard({ news, showSuitability = false }) {
  const formattedDate = news.publishedAt
    ? new Date(news.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Link href={`/news/${encodeURIComponent(news.id)}`}>
      <article className="news-card rounded-xl overflow-hidden cursor-pointer h-full flex flex-col">
        {/* Image */}
        {news.urlToImage && (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={news.urlToImage}
              alt={news.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Source and Date */}
          <div className="flex items-center gap-2 text-xs text-cream/50 mb-3">
            <span className="text-gold font-medium">{news.source}</span>
            {formattedDate && (
              <>
                <span>•</span>
                <span>{formattedDate}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-cream mb-2 line-clamp-2 hover:text-gold transition-colors">
            {news.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-cream/70 line-clamp-3 flex-1">
            {news.description}
          </p>

          {/* Suitability indicator (optional) */}
          {showSuitability && news.suitability && (
            <div className="mt-4 pt-4 border-t border-gold/10">
              <div className="flex flex-wrap gap-1">
                {news.suitability.reasons.slice(0, 2).map((reason) => (
                  <span
                    key={reason}
                    className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold capitalize"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Read more indicator */}
          <div className="mt-4 flex items-center text-gold text-sm font-medium">
            <span>Read Spiritual Reflection</span>
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}
