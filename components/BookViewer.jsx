'use client';

import { useMemo, useRef, useEffect } from 'react';

/**
 * Highlight text within content using fuzzy matching
 */
function HighlightedText({ text, highlight }) {
  const parts = useMemo(() => {
    if (!highlight || !text) return null;

    const normalizedText = text.replace(/\s+/g, ' ').trim();
    const normalizedHighlight = highlight.replace(/\s+/g, ' ').trim();
    const lowerText = normalizedText.toLowerCase();
    const lowerHighlight = normalizedHighlight.toLowerCase();
    const startIndex = lowerText.indexOf(lowerHighlight);

    if (startIndex === -1) {
      // Try partial match with first few words
      const words = lowerHighlight.split(' ').filter(w => w.length > 3);
      if (words.length >= 3) {
        const partial = words.slice(0, 4).join(' ');
        const partialIndex = lowerText.indexOf(partial);
        if (partialIndex !== -1) {
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
    return {
      before: normalizedText.slice(0, startIndex),
      matched: normalizedText.slice(startIndex, endIndex),
      after: normalizedText.slice(endIndex)
    };
  }, [text, highlight]);

  if (!parts) {
    return (
      <div className="text-cream/90 leading-relaxed whitespace-pre-wrap font-serif text-lg">
        {text?.replace(/\s+/g, ' ').trim()}
      </div>
    );
  }

  return (
    <div className="text-cream/90 leading-relaxed whitespace-pre-wrap font-serif text-lg">
      {parts.before}
      <mark className="bg-gold/30 px-1 py-0.5 rounded font-medium text-cream animate-pulse-highlight">
        {parts.matched}
      </mark>
      {parts.after}
    </div>
  );
}

/**
 * PDF Download Button Component
 */
function PdfButton({ pdfUrl }) {
  if (!pdfUrl) return null;

  return (
    <button
      onClick={() => window.open(pdfUrl, '_blank')}
      className="flex items-center gap-2 px-3 py-2 bg-gold/10 hover:bg-gold/20 rounded-lg text-gold transition-colors"
      title="Download PDF"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <span className="hidden sm:inline text-sm font-medium">PDF</span>
    </button>
  );
}

/**
 * BookViewer - Core book content viewer component
 *
 * Shared by CitationPanel (modal) and BookReader (full page)
 *
 * @param {Object} bookJson - Full annotation tool export JSON
 * @param {string} currentGroupId - Which group to display (e.g., "g_005")
 * @param {function} onGroupChange - Callback when group changes: (newGroupId) => {}
 * @param {string} highlightText - Optional text to highlight within content
 * @param {boolean} showNav - Show prev/next navigation buttons (default: true)
 * @param {string} pdfUrl - Optional PDF download URL
 * @param {string} className - Additional CSS classes for the container
 */
export default function BookViewer({
  bookJson,
  currentGroupId,
  onGroupChange,
  highlightText,
  showNav = true,
  pdfUrl,
  className = ''
}) {
  const contentRef = useRef(null);
  const highlightRef = useRef(null);

  // Get current group data
  const currentGroup = useMemo(() => {
    if (!bookJson?.groups || !currentGroupId) return null;
    return bookJson.groups.find(g => g.group_id === currentGroupId);
  }, [bookJson, currentGroupId]);

  // Get current index for navigation
  const currentIndex = useMemo(() => {
    if (!bookJson?.groups || !currentGroupId) return -1;
    return bookJson.groups.findIndex(g => g.group_id === currentGroupId);
  }, [bookJson, currentGroupId]);

  const totalGroups = bookJson?.groups?.length || 0;
  const bookTitle = bookJson?.book_metadata?.title || 'Book';

  // Navigate to previous/next group
  const navigateGroup = (direction) => {
    if (!bookJson?.groups || currentIndex === -1 || !onGroupChange) return;

    const newIndex = direction === 'prev'
      ? Math.max(0, currentIndex - 1)
      : Math.min(totalGroups - 1, currentIndex + 1);

    onGroupChange(bookJson.groups[newIndex].group_id);
  };

  // Auto-scroll to highlight when content changes
  useEffect(() => {
    if (highlightRef.current && highlightText) {
      const timer = setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentGroupId, highlightText]);

  // Scroll to top when group changes
  useEffect(() => {
    if (contentRef.current && !highlightText) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentGroupId, highlightText]);

  if (!currentGroup) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center text-cream/60">
          <span className="text-4xl mb-3 block">📖</span>
          <p>Group not found</p>
          <p className="text-xs mt-2">ID: {currentGroupId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="bg-dark-bg/50 border-b border-gold/20 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-gold text-lg flex-shrink-0">📖</span>
          <div className="min-w-0">
            <h2 className="text-gold font-medium truncate">{currentGroup.chapter}</h2>
            <div className="flex items-center gap-2 text-xs text-cream/60">
              {currentGroup.page_start && (
                <span>
                  Page {currentGroup.page_start}
                  {currentGroup.page_end && currentGroup.page_end !== currentGroup.page_start &&
                    `-${currentGroup.page_end}`}
                </span>
              )}
              <span>|</span>
              <span>{currentIndex + 1} / {totalGroups}</span>
            </div>
          </div>
        </div>

        <PdfButton pdfUrl={pdfUrl} />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto bg-dark-card"
      >
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div ref={highlightRef}>
            <HighlightedText
              text={currentGroup.combined_text}
              highlight={highlightText}
            />
          </div>

          {/* Meta info */}
          <div className="mt-6 pt-4 border-t border-gold/20 text-xs text-cream/40">
            <p>Paragraphs: {currentGroup.para_ids?.join(', ')}</p>
            <p>Tokens: ~{currentGroup.token_count}</p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      {showNav && (
        <div className="bg-dark-bg border-t border-gold/20 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => navigateGroup('prev')}
            disabled={currentIndex <= 0}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
              ${currentIndex <= 0
                ? 'text-cream/30 cursor-not-allowed'
                : 'text-gold hover:bg-gold/10'}
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">Previous</span>
          </button>

          <span className="text-xs text-cream/40">
            {bookTitle}
          </span>

          <button
            onClick={() => navigateGroup('next')}
            disabled={currentIndex >= totalGroups - 1}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
              ${currentIndex >= totalGroups - 1
                ? 'text-cream/30 cursor-not-allowed'
                : 'text-gold hover:bg-gold/10'}
            `}
          >
            <span className="text-sm font-medium hidden sm:inline">Next</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* CSS for highlight animation */}
      <style jsx>{`
        @keyframes pulse-highlight {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-highlight {
          animation: pulse-highlight 1s ease-in-out 2;
        }
      `}</style>
    </div>
  );
}

// Export HighlightedText for use in other components
export { HighlightedText };
