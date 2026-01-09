'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BookReader from '@/components/BookReader';

/**
 * Book Reader Page - /read/[slug]
 *
 * Dynamic route that loads book JSON and displays the BookReader.
 * Expects book JSON at /books/{slug}.json
 */
export default function ReadBookPage() {
  const params = useParams();
  const slug = params?.slug;

  const [bookJson, setBookJson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Construct PDF URL
  // CPS books are typically at: https://cpsglobal.org/wp-content/uploads/books/{slug}.pdf
  // But we'll use a configurable pattern
  const pdfUrl = slug ? `/books/${slug}.pdf` : null;

  // Load book JSON
  useEffect(() => {
    if (!slug) return;

    const loadBook = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch from public/books folder
        const response = await fetch(`/books/${slug}.json`);

        if (!response.ok) {
          throw new Error('Book not found');
        }

        const data = await response.json();
        setBookJson(data);
      } catch (err) {
        console.error('Failed to load book:', err);
        setError(err.message || 'Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4" />
          <p className="text-cream/60">Loading book...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <span className="text-5xl mb-4 block">📖</span>
          <h1 className="text-xl font-bold text-gold mb-2">Book Not Found</h1>
          <p className="text-cream/60 mb-6">
            Could not load "{slug}". Make sure the book JSON exists at /books/{slug}.json
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-gold text-dark-bg rounded-lg font-medium hover:bg-gold/90 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  // Book loaded successfully
  return (
    <BookReader
      bookJson={bookJson}
      pdfUrl={pdfUrl}
    />
  );
}
