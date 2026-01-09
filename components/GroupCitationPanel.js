'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/**
 * Highlight text within content using fuzzy matching
 */
function HighlightedText({ text, highlight }) {
  const parts = useMemo(() => {
    if (!highlight || !text) return null;

    // Normalize both for matching
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    const normalizedHighlight = highlight.replace(/\s+/g, ' ').trim();

    // Find the highlight in the text (case-insensitive)
    const lowerText = normalizedText.toLowerCase();
    const lowerHighlight = normalizedHighlight.toLowerCase();
    const startIndex = lowerText.indexOf(lowerHighlight);

    if (startIndex === -1) {
      // Highlight not found, try partial match with first few words
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
 * GroupCitationPanel - YouVersion-style slide-over panel for annotation tool JSON
 *
 * Works with annotation tool export format:
 * - groups[]: {group_id, para_ids, combined_text, token_count, chapter, page_start, page_end}
 * - book_metadata: {title, author, ...}
 */
export default function GroupCitationPanel({
  isOpen,
  onClose,
  groupId,
  searchText,
  bookJson
}) {
  const [currentGroupId, setCurrentGroupId] = useState(groupId);
  const highlightRef = useRef(null);

  // Update current group when prop changes
  useEffect(() => {
    if (groupId) {
      setCurrentGroupId(groupId);
    }
  }, [groupId]);

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

  // Get unique chapters for dropdown
  const chapters = useMemo(() => {
    if (!bookJson?.groups) return [];
    const seen = new Set();
    return bookJson.groups
      .filter(g => {
        if (seen.has(g.chapter)) return false;
        seen.add(g.chapter);
        return true;
      })
      .map(g => ({
        name: g.chapter,
        firstGroupId: g.group_id
      }));
  }, [bookJson]);

  // Navigate to previous/next group
  const navigateGroup = useCallback((direction) => {
    if (!bookJson?.groups || currentIndex === -1) return;

    const newIndex = direction === 'prev'
      ? Math.max(0, currentIndex - 1)
      : Math.min(bookJson.groups.length - 1, currentIndex + 1);

    setCurrentGroupId(bookJson.groups[newIndex].group_id);
  }, [bookJson, currentIndex]);

  // Jump to chapter
  const jumpToChapter = useCallback((chapterName) => {
    const chapter = chapters.find(c => c.name === chapterName);
    if (chapter) {
      setCurrentGroupId(chapter.firstGroupId);
    }
  }, [chapters]);

  // Auto-scroll to highlight
  useEffect(() => {
    if (highlightRef.current && searchText) {
      const timer = setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentGroupId, searchText]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        navigateGroup('prev');
      } else if (e.key === 'ArrowRight') {
        navigateGroup('next');
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
  }, [isOpen, onClose, navigateGroup]);

  if (!isOpen) return null;

  const bookTitle = bookJson?.book_metadata?.title || 'Book';
  const bookAuthor = bookJson?.book_metadata?.author || 'Maulana Wahiduddin Khan';
  const totalGroups = bookJson?.groups?.length || 0;

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
        {/* Header */}
        <div className="bg-dark-bg border-b border-gold/30 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
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

          {/* Chapter dropdown */}
          {chapters.length > 1 && (
            <select
              value={currentGroup?.chapter || ''}
              onChange={(e) => jumpToChapter(e.target.value)}
              className="bg-dark-bg border border-gold/30 rounded px-2 py-1 text-sm text-cream/80 max-w-[150px] truncate"
            >
              {chapters.map((ch) => (
                <option key={ch.name} value={ch.name}>
                  {ch.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Location indicator */}
        {currentGroup && (
          <div className="bg-gold/10 border-b border-gold/20 px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-gold flex-shrink-0">📖</span>
              <p className="text-sm text-cream/80 truncate">
                {currentGroup.chapter}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-cream/60">
              {currentGroup.page_start && (
                <span>
                  Page {currentGroup.page_start}
                  {currentGroup.page_end && currentGroup.page_end !== currentGroup.page_start &&
                    `-${currentGroup.page_end}`}
                </span>
              )}
              <span>
                {currentIndex + 1} / {totalGroups}
              </span>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-y-auto bg-dark-card">
          {currentGroup ? (
            <div className="max-w-2xl mx-auto px-6 py-6">
              {/* Group content with highlighting */}
              <div ref={highlightRef}>
                <HighlightedText
                  text={currentGroup.combined_text}
                  highlight={searchText}
                />
              </div>

              {/* Paragraph IDs (for reference) */}
              <div className="mt-6 pt-4 border-t border-gold/20">
                <p className="text-xs text-cream/40">
                  Paragraphs: {currentGroup.para_ids?.join(', ')}
                </p>
                <p className="text-xs text-cream/40">
                  Tokens: ~{currentGroup.token_count}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center h-full p-8">
              <div className="text-center text-cream/60">
                <span className="text-4xl mb-3 block">📖</span>
                <p>Group not found</p>
                <p className="text-xs mt-2">Group ID: {currentGroupId}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation footer */}
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

          <span className="text-xs text-cream/40 hidden sm:inline">
            Press ESC to close, arrows to navigate
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
      </div>

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
