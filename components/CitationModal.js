'use client';

import { getBookUrl } from '@/lib/book-links';

/**
 * Citation Modal Component
 * Shows full passage with link to CPS website source
 */
export default function CitationModal({ passage, isOpen, onClose }) {
  if (!isOpen || !passage) return null;

  const cpsUrl = passage.bookKey
    ? getBookUrl(passage.bookKey)
    : 'https://cpsglobal.org/books';

  // Clean rawContent for display (remove extra whitespace but keep full text)
  const displayContent = (passage.rawContent || passage.content || '')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-dark-card max-w-2xl w-full rounded-xl border border-gold/30 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gold/20 bg-dark-bg/50">
          <div className="flex items-center gap-2">
            <span className="text-lg">📖</span>
            <h3 className="text-gold font-medium">
              {passage.bookName || 'Maulana Wahiduddin Khan'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-cream/50 hover:text-cream text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream/10 transition-colors"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Full Passage */}
        <div className="p-6 overflow-y-auto flex-1">
          <blockquote className="text-cream/90 italic leading-relaxed text-lg spiritual-text">
            "{displayContent}"
          </blockquote>

          {/* Attribution */}
          <p className="text-cream/50 text-sm mt-4">
            — {passage.source || 'Maulana Wahiduddin Khan'}
          </p>
        </div>

        {/* Footer with CPS Link */}
        <div className="p-4 border-t border-gold/20 bg-dark-bg/50">
          <a
            href={cpsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gold hover:text-gold/80 hover:underline transition-colors"
          >
            <span>Read full book on CPS</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
