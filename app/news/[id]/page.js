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
  const [whatHappened, setWhatHappened] = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [inlineCitations, setInlineCitations] = useState([]);
  const [quranicPerspective, setQuranicPerspective] = useState(null);
  const [quranVerse, setQuranVerse] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);
  const [error, setError] = useState(null);

  // Fetch news and interpretation
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingNews(true);

      try {
        // Fetch article (checks Supabase for approved content first)
        const newsResponse = await fetch(`/api/news?id=${encodeURIComponent(params.id)}`);
        const newsData = await newsResponse.json();

        let article = newsData.article || null;

        if (!newsData.success || !article) {
          setError(newsData.message || 'This article is no longer available.');
          return;
        }

        setNews(article);
        setIsLoadingNews(false);

        // Check if article has stored AI content (from approved database)
        if (article.aiContent?.interpretation) {
          // Use stored AI content - no need to generate
          setWhatHappened(article.aiContent.whatHappened);
          setInterpretation(article.aiContent.interpretation);
          setInlineCitations(article.aiContent.inlineCitations || []);
          setQuranicPerspective(article.aiContent.quranicPerspective || null);
          setFromCache(true);
        } else {
          // Fallback: Generate interpretation on-the-fly (dev mode)
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
            setWhatHappened(interpretData.whatHappened);
            setInterpretation(interpretData.interpretation);
            setInlineCitations(interpretData.inlineCitations || []);
            setQuranicPerspective(interpretData.quranicPerspective || null);
            setFromCache(interpretData.fromCache || false);
          } else {
            setError('Failed to generate interpretation');
          }
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
        whatHappened={whatHappened}
        interpretation={interpretation || ''}
        inlineCitations={inlineCitations}
        quranicPerspective={quranicPerspective}
        isLoading={isLoadingInterpretation}
        fromCache={fromCache}
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
      {quranVerse && (
        <div className="mt-12 p-6 bg-dark-card/30 rounded-xl border border-gold/10 text-center">
          <p className="spiritual-text text-cream/70 italic">
            "{quranVerse.text}"
          </p>
          <p className="text-gold text-sm mt-2">— Quran {quranVerse.ref}</p>
        </div>
      )}
    </div>
  );
}
