'use client';

import { useMemo, useEffect } from 'react';
import { getBookUrl } from '@/lib/book-links';

/**
 * Component to render text with a highlighted portion
 */
function HighlightedText({ text, highlight }) {
  const parts = useMemo(() => {
    if (!highlight || !text) {
      return null;
    }

    // Normalize both for matching
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    const normalizedHighlight = highlight.replace(/\s+/g, ' ').trim();

    // Find the highlight in the text (case-insensitive)
    const lowerText = normalizedText.toLowerCase();
    const lowerHighlight = normalizedHighlight.toLowerCase();
    const startIndex = lowerText.indexOf(lowerHighlight);

    if (startIndex === -1) {
      // Highlight not found, try partial match
      const words = lowerHighlight.split(' ').filter(w => w.length > 3);
      if (words.length >= 3) {
        const partial = words.slice(0, 4).join(' ');
        const partialIndex = lowerText.indexOf(partial);
        if (partialIndex !== -1) {
          // Found partial, highlight approximate region
          const endIndex = Math.min(partialIndex + normalizedHighlight.length, normalizedText.length);
          return {
            before: normalizedText.slice(0, partialIndex),
            matched: normalizedText.slice(partialIndex, endIndex),
            after: normalizedText.slice(endIndex)
          };
        }
      }
      return null;
    }

    const endIndex = startIndex + normalizedHighlight.length;
    const before = normalizedText.slice(0, startIndex);
    const matched = normalizedText.slice(startIndex, endIndex);
    const after = normalizedText.slice(endIndex);

    return { before, matched, after };
  }, [text, highlight]);

  if (!parts) {
    return (
      <p className="text-cream/90 leading-relaxed whitespace-pre-wrap">
        {text?.replace(/\s+/g, ' ').trim()}
      </p>
    );
  }

  return (
    <p className="text-cream/90 leading-relaxed whitespace-pre-wrap">
      {parts.before}
      <mark className="bg-gold/30 px-0.5 rounded font-medium text-cream">
        {parts.matched}
      </mark>
      {parts.after}
    </p>
  );
}

/**
 * Citation Modal Component
 * Shows full passage with highlighted quote and link to CPS website
 */
export default function CitationModal({ passage, isOpen, onClose }) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !passage) return null;

  const cpsUrl = passage.bookKey
    ? getBookUrl(passage.bookKey)
    : 'https://cpsglobal.org/books';

  // Clean content for display
  const displayContent = (passage.text || passage.rawContent || passage.content || '')
    .replace(/\s+/g, ' ')
    .trim();

  const hasHighlight = passage.highlightedQuote && passage.highlightedQuote.length > 0;

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
            <div>
              <h3 className="text-gold font-medium">
                {passage.bookName || 'Maulana Wahiduddin Khan'}
              </h3>
              <p className="text-cream/50 text-xs">Source Reference</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-cream/50 hover:text-cream text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream/10 transition-colors"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Key Quote - Only shown when highlighted quote exists */}
          {hasHighlight && (
            <div>
              <h4 className="text-xs font-semibold text-cream/60 mb-2 uppercase tracking-wide">
                Key Quote
              </h4>
              <div className="bg-gold/10 border-l-4 border-gold p-4 rounded-r">
                <p className="text-cream font-medium leading-relaxed italic">
                  "{passage.highlightedQuote}"
                </p>
              </div>
            </div>
          )}

          {/* Full Context with highlighting */}
          <div>
            <h4 className="text-xs font-semibold text-cream/60 mb-2 uppercase tracking-wide">
              Full Context
            </h4>
            <div className="bg-dark-bg/50 p-4 rounded border border-cream/10">
              <HighlightedText
                text={displayContent}
                highlight={passage.highlightedQuote}
              />
            </div>
          </div>

          {/* Source Attribution */}
          <p className="text-cream/50 text-sm">
            — {passage.source || 'Maulana Wahiduddin Khan'}
          </p>
        </div>

        {/* Footer with CPS Link */}
        <div className="p-4 border-t border-gold/20 bg-dark-bg/50 flex justify-between items-center">
          <span className="text-xs text-cream/40">
            Press ESC or click outside to close
          </span>
          <a
            href={cpsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gold hover:text-gold/80 hover:underline transition-colors font-medium"
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
