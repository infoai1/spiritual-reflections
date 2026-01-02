'use client';

import { useState, useEffect } from 'react';

const CATEGORIES = [
  { id: 'inspiration', name: 'Inspiration', color: 'amber' },
  { id: 'science', name: 'Science', color: 'blue' },
  { id: 'nature', name: 'Nature', color: 'green' },
  { id: 'health', name: 'Health', color: 'teal' }
];

export default function QueuePage() {
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);

  // Fetch queue on mount
  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await fetch('/api/admin/queue');
      const data = await response.json();
      if (data.success) {
        setQueue(data.queue || []);
      }
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNewArticles = async () => {
    setIsFetching(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/queue', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchQueue(); // Refresh the queue
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch new articles' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleAction = async (id, action, category = null) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/queue/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, category })
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        // Remove from local state
        setQueue(queue.filter(item => item.id !== id));
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Action failed' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cream">Review Queue</h1>
          <p className="text-cream/60 mt-1">AI-selected articles awaiting approval</p>
        </div>
        <button
          onClick={fetchNewArticles}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-dark-bg font-medium rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          {isFetching ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Fetching...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Fetch New Articles
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <svg className="w-8 h-8 animate-spin text-gold mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-cream/60">Loading queue...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && queue.length === 0 && (
        <div className="text-center py-12 bg-dark-card border border-gold/20 rounded-xl">
          <svg className="w-12 h-12 text-cream/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-cream/60 mb-4">No articles in queue</p>
          <button
            onClick={fetchNewArticles}
            disabled={isFetching}
            className="text-gold hover:underline"
          >
            Fetch new articles from NewsAPI
          </button>
        </div>
      )}

      {/* Queue Items */}
      {!isLoading && queue.length > 0 && (
        <div className="space-y-4">
          {queue.map((item) => (
            <div
              key={item.id}
              className="bg-dark-card border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-colors"
            >
              <div className="flex gap-6">
                {/* Image */}
                {item.url_to_image && (
                  <div className="hidden sm:block w-32 h-24 flex-shrink-0">
                    <img
                      src={item.url_to_image}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-cream font-medium line-clamp-2">{item.title}</h3>
                      <p className="text-cream/50 text-sm mt-1 line-clamp-2">{item.description}</p>
                    </div>

                    {/* AI Score Badge */}
                    <div className="flex-shrink-0 text-center">
                      <div className={`text-lg font-bold ${
                        item.ai_score >= 10 ? 'text-green-400' :
                        item.ai_score >= 5 ? 'text-amber-400' : 'text-cream/50'
                      }`}>
                        {item.ai_score || 0}
                      </div>
                      <div className="text-xs text-cream/40">AI Score</div>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-3 text-sm text-cream/50">
                    <span>{item.source}</span>
                    {item.suggested_category && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{item.suggested_category}</span>
                      </>
                    )}
                    {item.ai_reasons && item.ai_reasons.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{item.ai_reasons.slice(0, 3).join(', ')}</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4">
                    {/* Approve with Category */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-cream/50">Approve as:</span>
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleAction(item.id, 'approve', cat.id)}
                          disabled={actionLoading === item.id}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors disabled:opacity-50 ${
                            cat.color === 'amber' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' :
                            cat.color === 'blue' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' :
                            cat.color === 'green' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' :
                            'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    {/* Reject */}
                    <button
                      onClick={() => handleAction(item.id, 'reject')}
                      disabled={actionLoading === item.id}
                      className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 ml-auto"
                    >
                      Reject
                    </button>

                    {/* View Original */}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cream/50 hover:text-cream text-sm"
                      >
                        View Original
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
