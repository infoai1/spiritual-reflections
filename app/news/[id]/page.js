'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import SpiritualInterpretation from '@/components/SpiritualInterpretation';
import ShareButtons from '@/components/ShareButtons';
import FavoriteButton from '@/components/FavoriteButton';

export default function NewsDetailPage() {
  const params = useParams();
  const [news, setNews] = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [relevantPassages, setRelevantPassages] = useState([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);
  const [error, setError] = useState(null);

  // Fetch news and then interpretation
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingNews(true);

      try {
        // First, get the news article
        const newsResponse = await fetch('/api/news?limit=20');
        const newsData = await newsResponse.json();

        if (newsData.success) {
          const article = newsData.news.find(n => n.id === params.id);

          if (article) {
            setNews(article);
            setIsLoadingNews(false);

            // Now fetch the interpretation
            setIsLoadingInterpretation(true);
            const interpretResponse = await fetch('/api/interpret', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: article.id,
                title: article.title,
                description: article.description,
                content: article.content,
                source: article.source,
              }),
            });

            const interpretData = await interpretResponse.json();

            if (interpretData.success) {
              setInterpretation(interpretData.interpretation);
              setRelevantPassages(interpretData.relevantPassages || []);
            } else {
              setError('Failed to generate interpretation');
            }
          } else {
            setError('Article not found');
          }
        } else {
          setError('Failed to load news');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load content');
      } finally {
        setIsLoadingNews(false);
        setIsLoadingInterpretation(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (isLoadingNews) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-cream/10 rounded w-3/4" />
          <div className="h-64 bg-cream/10 rounded" />
          <div className="h-4 bg-cream/10 rounded w-full" />
          <div className="h-4 bg-cream/10 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error && !news) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/" className="text-gold hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-cream/60 hover:text-gold transition-colors mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to News
      </Link>

      {/* News Article */}
      {news && (
        <article className="mb-8">
          {/* Image */}
          {news.urlToImage && (
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6">
              <img
                src={news.urlToImage}
                alt={news.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 to-transparent" />
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-cream/50 mb-4">
            <span className="text-gold font-medium">{news.source}</span>
            {news.publishedAt && (
              <>
                <span>•</span>
                <span>
                  {new Date(news.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </>
            )}
            {news.author && (
              <>
                <span>•</span>
                <span>By {news.author}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-cream mb-4">
            {news.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-cream/80 leading-relaxed mb-4">
            {news.description}
          </p>

          {/* Content */}
          {news.content && news.content !== news.description && (
            <div className="text-cream/70 leading-relaxed">
              <p>{news.content}</p>
            </div>
          )}

          {/* Original Article Link */}
          {news.url && news.url !== '#' && (
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-gold hover:underline mt-4"
            >
              Read original article
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </article>
      )}

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-gold/20" />
        <span className="text-gold text-lg">&#9672;</span>
        <div className="flex-1 h-px bg-gold/20" />
      </div>

      {/* Spiritual Interpretation */}
      <SpiritualInterpretation
        interpretation={interpretation || ''}
        relevantPassages={relevantPassages}
        isLoading={isLoadingInterpretation}
      />

      {/* Actions */}
      {news && interpretation && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 p-4 bg-dark-card/50 rounded-xl">
          <FavoriteButton
            item={{
              id: news.id,
              title: news.title,
              description: news.description,
              source: news.source,
              urlToImage: news.urlToImage,
              interpretation,
            }}
          />
          <ShareButtons
            title={news.title}
            interpretation={interpretation}
          />
        </div>
      )}

      {/* Related Quranic Reminder */}
      <div className="mt-12 p-6 bg-dark-card/30 rounded-xl border border-gold/10 text-center">
        <p className="spiritual-text text-cream/70 italic">
          "And He has subjected to you whatever is in the heavens and whatever is on the earth—
          all from Him. Indeed in that are signs for a people who give thought."
        </p>
        <p className="text-gold text-sm mt-2">— Quran 45:13</p>
      </div>
    </div>
  );
}
