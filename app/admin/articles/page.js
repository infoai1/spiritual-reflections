'use client';

import { useState, useEffect } from 'react';

const CATEGORIES = [
  { id: '', name: 'All Categories' },
  { id: 'inspiration', name: 'Inspiration' },
  { id: 'science', name: 'Science' },
  { id: 'nature', name: 'Nature' },
  { id: 'health', name: 'Health' }
];

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchArticles();
  }, [page, categoryFilter, statusFilter]);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (categoryFilter) params.set('category', categoryFilter);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/admin/articles?${params}`);
      const data = await response.json();
      if (data.success) {
        setArticles(data.articles || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        // Update local state
        setArticles(articles.map(a =>
          a.id === id ? { ...a, status } : a
        ));
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update article' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Article deleted' });
        // Remove from local state
        setArticles(articles.filter(a => a.id !== id));
        setTotal(total - 1);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete article' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cream">Manage Articles</h1>
          <p className="text-cream/60 mt-1">{total} total articles</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-dark-card border border-gold/30 rounded-lg text-cream focus:outline-none focus:border-gold"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-dark-card border border-gold/30 rounded-lg text-cream focus:outline-none focus:border-gold"
        >
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="hidden">Hidden</option>
        </select>
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
          <p className="text-cream/60">Loading articles...</p>
        </div>
      )}

      {/* Articles Table */}
      {!isLoading && articles.length > 0 && (
        <div className="bg-dark-card border border-gold/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/20">
                  <th className="text-left py-4 px-6 text-cream/70 font-medium">Article</th>
                  <th className="text-left py-4 px-4 text-cream/70 font-medium">Category</th>
                  <th className="text-left py-4 px-4 text-cream/70 font-medium">Source</th>
                  <th className="text-left py-4 px-4 text-cream/70 font-medium">Status</th>
                  <th className="text-right py-4 px-6 text-cream/70 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b border-gold/10 hover:bg-gold/5">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {article.url_to_image && (
                          <img
                            src={article.url_to_image}
                            alt=""
                            className="w-12 h-12 object-cover rounded-lg hidden sm:block"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-cream font-medium line-clamp-1">{article.title}</p>
                          <p className="text-cream/50 text-sm">
                            {new Date(article.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded capitalize ${
                        article.category === 'inspiration' ? 'bg-amber-500/20 text-amber-400' :
                        article.category === 'science' ? 'bg-blue-500/20 text-blue-400' :
                        article.category === 'nature' ? 'bg-green-500/20 text-green-400' :
                        article.category === 'health' ? 'bg-teal-500/20 text-teal-400' :
                        'bg-cream/10 text-cream/50'
                      }`}>
                        {article.category || 'None'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-cream/70 text-sm">{article.source}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        article.status === 'approved'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {article.status === 'approved' ? (
                          <button
                            onClick={() => handleStatusChange(article.id, 'hidden')}
                            disabled={actionLoading === article.id}
                            className="text-amber-400 hover:text-amber-300 text-sm disabled:opacity-50"
                          >
                            Hide
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(article.id, 'approved')}
                            disabled={actionLoading === article.id}
                            className="text-green-400 hover:text-green-300 text-sm disabled:opacity-50"
                          >
                            Restore
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(article.id)}
                          disabled={actionLoading === article.id}
                          className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                        >
                          Delete
                        </button>
                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cream/50 hover:text-cream text-sm"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gold/20">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm text-cream/70 hover:text-cream disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-cream/60 text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm text-cream/70 hover:text-cream disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && articles.length === 0 && (
        <div className="text-center py-12 bg-dark-card border border-gold/20 rounded-xl">
          <p className="text-cream/60">No articles found</p>
        </div>
      )}
    </div>
  );
}
