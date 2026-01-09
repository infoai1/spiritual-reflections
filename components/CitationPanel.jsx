'use client';

import { useState, useEffect, useCallback } from 'react';
import BookViewer from './BookViewer';

/**
 * CitationPanel - Modal wrapper for displaying book citations
 *
 * Slide-over panel that shows book content with highlighted search text.
 * Used when user clicks on a citation/reference.
 *
 * @param {boolean} isOpen - Whether the panel is visible
 * @param {function} onClose - Callback to close the panel
 * @param {string} groupId - Initial group to display (e.g., "g_005")
 * @param {string} searchText - Text to highlight within the content
 * @param {Object} bookJson - Full annotation tool export JSON
 * @param {string} pdfUrl - Optional PDF download URL
 */
export default function CitationPanel({
  isOpen,
  onClose,
  groupId,
  searchText,
  bookJson,
  pdfUrl
}) {
  const [currentGroupId, setCurrentGroupId] = useState(groupId);

  // Update current group when prop changes
  useEffect(() => {
    if (groupId) {
      setCurrentGroupId(groupId);
    }
  }, [groupId]);

  // Handle group navigation
  const handleGroupChange = useCallback((newGroupId) => {
    setCurrentGroupId(newGroupId);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeydown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const bookTitle = bookJson?.book_metadata?.title || 'Book';
  const bookAuthor = bookJson?.book_metadata?.author || 'Maulana Wahiduddin Khan';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel - slides in from right */}
      <div
        className={`
          absolute right-0 top-0 bottom-0 bg-dark-card shadow-2xl
          transform transition-transform duration-300 ease-out
          w-full sm:w-[85%] md:w-[65%] lg:w-[50%] xl:w-[45%]
          flex flex-col border-l border-gold/30
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header with close button */}
        <div className="bg-dark-bg border-b border-gold/30 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream/10 rounded-full transition-colors flex-shrink-0 text-cream"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gold truncate">{bookTitle}</h1>
            <p className="text-cream/60 text-xs truncate">{bookAuthor}</p>
          </div>
        </div>

        {/* Search text indicator */}
        {searchText && (
          <div className="bg-gold/10 border-b border-gold/20 px-4 py-2 flex items-center gap-2 flex-shrink-0">
            <span className="text-gold flex-shrink-0">🔍</span>
            <p className="text-sm text-cream/80 truncate italic">
              "{searchText}"
            </p>
          </div>
        )}

        {/* BookViewer content */}
        <div className="flex-1 overflow-hidden">
          <BookViewer
            bookJson={bookJson}
            currentGroupId={currentGroupId}
            onGroupChange={handleGroupChange}
            highlightText={searchText}
            showNav={true}
            pdfUrl={pdfUrl}
            className="h-full"
          />
        </div>

        {/* Footer hint */}
        <div className="bg-dark-bg border-t border-gold/20 px-4 py-2 text-xs text-cream/40 flex-shrink-0">
          Press ESC to close
        </div>
      </div>
    </div>
  );
}
