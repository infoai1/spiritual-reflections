'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AIReviewPage() {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [fullArticle, setFullArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFull, setIsLoadingFull] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  // Fetch pending articles
  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/ai-review');
      const data = await res.json();

      if (data.success) {
        setArticles(data.articles || []);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch articles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Fetch full article for review
  const viewArticle = async (article) => {
    setSelectedArticle(article);
    setIsLoadingFull(true);
    setFullArticle(null);

    try {
      const res = await fetch(`/api/admin/ai-review/${article.externalId}`);
      const data = await res.json();

      if (data.success) {
        setFullArticle(data.article);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch article details');
    } finally {
      setIsLoadingFull(false);
    }
  };

  // Approve or reject article
  const handleAction = async (articleId, action) => {
    setActionLoading(articleId);
    try {
      const res = await fetch(`/api/admin/ai-review/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      const data = await res.json();

      if (data.success) {
        // Remove from list
        setArticles(articles.filter(a => a.id !== articleId));
        setSelectedArticle(null);
        setFullArticle(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cream">AI Review Queue</h1>
          <p className="text-cream/60 mt-1">Review and approve AI-generated reflections</p>
        </div>
        <Link
          href="/admin"
          className="text-gold hover:text-gold/80 text-sm"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-4 underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending List */}
        <div className="bg-dark-card border border-gold/20 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-gold mb-4">
            Pending Reviews ({articles.length})
          </h2>

          {isLoading ? (
            <div className="text-cream/50 text-center py-8">Loading...</div>
          ) : articles.length === 0 ? (
            <div className="text-cream/50 text-center py-8">
              No pending articles to review
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {articles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => viewArticle(article)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedArticle?.id === article.id
                      ? 'border-gold bg-gold/10'
                      : 'border-cream/10 hover:border-gold/30 bg-dark-bg/50'
                  }`}
                >
                  <h3 className="text-cream font-medium line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-cream/50 text-sm mt-1">
                    {article.source} • {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                  {article.aiPreview && (
                    <p className="text-cream/40 text-xs mt-2 line-clamp-2">
                      AI: {article.aiPreview.whatHappened}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="bg-dark-card border border-gold/20 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-gold mb-4">
            AI Content Preview
          </h2>

          {!selectedArticle ? (
            <div className="text-cream/50 text-center py-8">
              Select an article to preview
            </div>
          ) : isLoadingFull ? (
            <div className="text-cream/50 text-center py-8">Loading full content...</div>
          ) : !fullArticle ? (
            <div className="text-cream/50 text-center py-8">Failed to load article</div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {/* Article Info */}
              <div className="bg-dark-bg/50 p-3 rounded-lg">
                <h3 className="text-cream font-medium">{fullArticle.title}</h3>
                <p className="text-cream/50 text-sm">{fullArticle.source}</p>
                {fullArticle.url && (
                  <a
                    href={fullArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold text-xs hover:underline"
                  >
                    View Original →
                  </a>
                )}
              </div>

              {/* AI What Happened */}
              {fullArticle.aiContent?.whatHappened && (
                <div>
                  <h4 className="text-gold text-sm font-medium mb-2">📰 What Happened</h4>
                  <p className="text-cream/80 text-sm bg-dark-bg/30 p-3 rounded">
                    {fullArticle.aiContent.whatHappened}
                  </p>
                </div>
              )}

              {/* AI Interpretation */}
              {fullArticle.aiContent?.interpretation && (
                <div>
                  <h4 className="text-gold text-sm font-medium mb-2">✦ Spiritual Reflection</h4>
                  <div className="text-cream/80 text-sm bg-dark-bg/30 p-3 rounded whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                    {fullArticle.aiContent.interpretation}
                  </div>
                </div>
              )}

              {/* Quranic Perspective */}
              {fullArticle.aiContent?.quranicPerspective?.found && (
                <div>
                  <h4 className="text-gold text-sm font-medium mb-2">📜 Quranic Perspective</h4>
                  <div className="text-cream/80 text-sm bg-dark-bg/30 p-3 rounded">
                    <p className="font-medium text-gold/80">
                      {fullArticle.aiContent.quranicPerspective.concept?.name}
                    </p>
                    <p className="mt-1 italic">
                      {fullArticle.aiContent.quranicPerspective.reflection}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gold/10">
                <button
                  onClick={() => handleAction(fullArticle.id, 'approve')}
                  disabled={actionLoading === fullArticle.id}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {actionLoading === fullArticle.id ? 'Processing...' : '✓ Approve'}
                </button>
                <button
                  onClick={() => handleAction(fullArticle.id, 'reject')}
                  disabled={actionLoading === fullArticle.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {actionLoading === fullArticle.id ? 'Processing...' : '✗ Reject'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
