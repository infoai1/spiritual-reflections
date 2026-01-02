'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { id: 'inspiration', name: 'Inspiration' },
  { id: 'science', name: 'Science' },
  { id: 'nature', name: 'Nature' },
  { id: 'health', name: 'Health' }
];

export default function AddArticlePage() {
  const router = useRouter();
  const [mode, setMode] = useState('url'); // 'url' or 'manual'
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Form fields
  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    source: '',
    author: '',
    urlToImage: '',
    category: ''
  });

  const fetchUrlMetadata = async () => {
    if (!url) {
      setMessage({ type: 'error', text: 'Please enter a URL' });
      return;
    }

    setIsFetching(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (data.success) {
        setForm({
          title: data.metadata.title || '',
          description: data.metadata.description || '',
          content: data.metadata.description || '',
          source: data.metadata.source || '',
          author: data.metadata.author || '',
          urlToImage: data.metadata.urlToImage || '',
          category: ''
        });
        // Update URL to final URL after redirects
        setUrl(data.metadata.url || url);
        setMessage({ type: 'success', text: 'Metadata extracted successfully' });
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch URL metadata' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title) {
      setMessage({ type: 'error', text: 'Title is required' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          url: mode === 'url' ? url : null
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Article created successfully!' });
        // Reset form
        setForm({
          title: '',
          description: '',
          content: '',
          source: '',
          author: '',
          urlToImage: '',
          category: ''
        });
        setUrl('');
        // Redirect to articles page after short delay
        setTimeout(() => router.push('/admin/articles'), 1500);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create article' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-cream">Add Article</h1>
        <p className="text-cream/60 mt-1">Add a new article manually or from a URL</p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('url')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            mode === 'url'
              ? 'bg-gold text-dark-bg'
              : 'bg-dark-card text-cream/70 hover:text-cream'
          }`}
        >
          Import from URL
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            mode === 'manual'
              ? 'bg-gold text-dark-bg'
              : 'bg-dark-card text-cream/70 hover:text-cream'
          }`}
        >
          Manual Entry
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

      {/* URL Import Section */}
      {mode === 'url' && (
        <div className="bg-dark-card border border-gold/20 rounded-xl p-6">
          <label className="block text-sm font-medium text-cream/80 mb-2">
            Article URL
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article..."
              className="flex-1 px-4 py-3 bg-dark-bg border border-gold/30 rounded-lg text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
            />
            <button
              onClick={fetchUrlMetadata}
              disabled={isFetching || !url}
              className="px-6 py-3 bg-gold text-dark-bg font-medium rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              {isFetching ? 'Fetching...' : 'Fetch'}
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-dark-card border border-gold/20 rounded-xl p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-cream/80 mb-2">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleFormChange('title', e.target.value)}
            className="w-full px-4 py-3 bg-dark-bg border border-gold/30 rounded-lg text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
            placeholder="Article title..."
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-cream/80 mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-dark-bg border border-gold/30 rounded-lg text-cream placeholder-cream/40 focus:outline-none focus:border-gold resize-none"
            placeholder="Brief description..."
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-cream/80 mb-2">
            Content
          </label>
          <textarea
            value={form.content}
            onChange={(e) => handleFormChange('content', e.target.value)}
            rows={5}
            className="w-full px-4 py-3 bg-dark-bg border border-gold/30 rounded-lg text-cream placeholder-cream/40 focus:outline-none focus:border-gold resize-none"
            placeholder="Full article content (optional - used for interpretation)..."
          />
        </div>

        {/* Row: Source and Author */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-cream/80 mb-2">
              Source
            </label>
            <input
              type="text"
              value={form.source}
              onChange={(e) => handleFormChange('source', e.target.value)}
              className="w-full px-4 py-3 bg-dark-bg border border-gold/30 rounded-lg text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
              placeholder="BBC News, Reuters..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cream/80 mb-2">
              Author
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => handleFormChange('author', e.target.value)}
              className="w-full px-4 py-3 bg-dark-bg border border-gold/30 rounded-lg text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
              placeholder="Author name..."
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-cream/80 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={form.urlToImage}
            onChange={(e) => handleFormChange('urlToImage', e.target.value)}
            className="w-full px-4 py-3 bg-dark-bg border border-gold/30 rounded-lg text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
            placeholder="https://example.com/image.jpg"
          />
          {form.urlToImage && (
            <img
              src={form.urlToImage}
              alt="Preview"
              className="mt-3 max-h-40 rounded-lg"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-cream/80 mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleFormChange('category', cat.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  form.category === cat.id
                    ? 'bg-gold text-dark-bg'
                    : 'bg-dark-bg border border-gold/30 text-cream/70 hover:text-cream'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gold/20">
          <button
            type="button"
            onClick={() => router.push('/admin/articles')}
            className="px-6 py-3 text-cream/70 hover:text-cream transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !form.title}
            className="px-6 py-3 bg-gold text-dark-bg font-medium rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Article'}
          </button>
        </div>
      </form>
    </div>
  );
}
