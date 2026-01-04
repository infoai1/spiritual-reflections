'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * YouVersion-style slide-over book viewer panel for Spiritual Reflections
 * Fetches book data from Islamic Demo API (learn.spiritualmessage.org)
 */

const ISLAMIC_DEMO_API = 'https://learn.spiritualmessage.org/api/books';

export default function BookViewerPanel({
  isOpen,
  onClose,
  bookSlug,
  highlightQuote,
  pageNumber,
  onFallback // Called when book not available, to show CitationModal instead
}) {
  const [book, setBook] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [chapterContent, setChapterContent] = useState(null);
  const [quoteLocation, setQuoteLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const contentRef = useRef(null);
  const highlightRef = useRef(null);

  // Fetch book details
  useEffect(() => {
    if (!isOpen || !bookSlug) return;

    const fetchBook = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${ISLAMIC_DEMO_API}/${bookSlug}`);

        if (!response.ok) {
          // Book not available - trigger fallback
          if (onFallback) {
            onFallback();
            return;
          }
          throw new Error('Book not found');
        }

        const data = await response.json();
        setBook(data);

        // If we have a quote, find its location
        if (highlightQuote) {
          try {
            const quoteResponse = await fetch(
              `${ISLAMIC_DEMO_API}/${bookSlug}/quote-location?q=${encodeURIComponent(highlightQuote)}`
            );
            if (quoteResponse.ok) {
              const locationData = await quoteResponse.json();
              setQuoteLocation(locationData);

              // Auto-select the chapter containing the quote
              if (locationData.found && locationData.chapter_id) {
                setSelectedChapterId(locationData.chapter_id);
              }
            }
          } catch (err) {
            console.log('Could not find quote location');
          }
        }

        // If no quote location, select first chapter
        if (!highlightQuote && data.chapters?.length > 0) {
          setSelectedChapterId(data.chapters[0].id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [isOpen, bookSlug, highlightQuote, onFallback]);

  // Fetch chapter content when selection changes
  useEffect(() => {
    if (!selectedChapterId || !bookSlug) return;

    const fetchChapter = async () => {
      try {
        const response = await fetch(
          `${ISLAMIC_DEMO_API}/${bookSlug}/chapters/${selectedChapterId}`
        );
        if (response.ok) {
          const data = await response.json();
          setChapterContent(data);
        }
      } catch (err) {
        console.error('Failed to load chapter:', err);
      }
    };

    fetchChapter();
  }, [selectedChapterId, bookSlug]);

  // Auto-scroll to highlighted quote when content loads
  useEffect(() => {
    if (highlightRef.current && highlightQuote) {
      const timer = setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [chapterContent?.id, highlightQuote]);

  // Close on escape key + keyboard navigation
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Arrow key navigation
      if (!book || !selectedChapterId) return;

      const flatChapters = flattenChapters(book.chapters || []);
      const currentIndex = flatChapters.findIndex(c => c.id === selectedChapterId);

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setSelectedChapterId(flatChapters[currentIndex - 1].id);
      } else if (e.key === 'ArrowRight' && currentIndex < flatChapters.length - 1) {
        setSelectedChapterId(flatChapters[currentIndex + 1].id);
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
  }, [isOpen, onClose, book, selectedChapterId]);

  // Helper to flatten chapter tree
  const flattenChapters = (chapters) => {
    const result = [];
    const traverse = (items) => {
      for (const item of items) {
        result.push(item);
        if (item.children?.length > 0) {
          traverse(item.children);
        }
      }
    };
    traverse(chapters);
    return result;
  };

  // Navigate to previous/next chapter
  const navigateChapter = useCallback((direction) => {
    if (!book || !selectedChapterId) return;

    const flatChapters = flattenChapters(book.chapters || []);
    const currentIndex = flatChapters.findIndex(c => c.id === selectedChapterId);

    if (direction === 'prev' && currentIndex > 0) {
      setSelectedChapterId(flatChapters[currentIndex - 1].id);
    } else if (direction === 'next' && currentIndex < flatChapters.length - 1) {
      setSelectedChapterId(flatChapters[currentIndex + 1].id);
    }
  }, [book, selectedChapterId]);

  // Render highlighted content
  const renderContent = () => {
    if (!chapterContent) return null;

    const content = chapterContent.content;

    if (!highlightQuote || !quoteLocation?.found) {
      return content.split('\n\n').map((para, idx) => (
        <p key={idx} className="mb-6 leading-relaxed">
          {para}
        </p>
      ));
    }

    // Find and highlight the quote
    const normalizedContent = content.toLowerCase();
    const normalizedQuote = highlightQuote.toLowerCase().trim();
    let quoteStart = normalizedContent.indexOf(normalizedQuote);
    let quoteEnd = quoteStart !== -1 ? quoteStart + highlightQuote.length : -1;

    if (quoteLocation.char_start !== null && quoteLocation.char_end !== null) {
      quoteStart = quoteLocation.char_start;
      quoteEnd = quoteLocation.char_end;
    }

    if (quoteStart === -1) {
      return content.split('\n\n').map((para, idx) => (
        <p key={idx} className="mb-6 leading-relaxed">
          {para}
        </p>
      ));
    }

    // Render with highlight
    const paragraphs = content.split('\n\n');
    let currentPos = 0;
    const elements = [];
    let highlightInserted = false;

    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      const paraStart = currentPos;
      const paraEnd = currentPos + para.length;

      if (!highlightInserted && quoteStart >= paraStart && quoteStart < paraEnd) {
        const localStart = quoteStart - paraStart;
        const localEnd = Math.min(quoteEnd - paraStart, para.length);

        const before = para.slice(0, localStart);
        const highlighted = para.slice(localStart, localEnd);
        const after = para.slice(localEnd);

        elements.push(
          <p key={i} className="mb-6 leading-relaxed">
            {before}
            <span
              ref={highlightRef}
              className="bg-gold/30 px-1 py-0.5 rounded font-medium text-cream animate-pulse-twice"
            >
              {highlighted}
            </span>
            {after}
          </p>
        );
        highlightInserted = true;
      } else {
        elements.push(
          <p key={i} className="mb-6 leading-relaxed">
            {para}
          </p>
        );
      }

      currentPos = paraEnd + 2;
    }

    return elements;
  };

  if (!isOpen) return null;

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
          w-[85%] md:w-[65%] lg:w-[50%] xl:w-[45%]
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
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gold truncate">{book?.title || 'Loading...'}</h1>
              {book?.author && (
                <p className="text-cream/60 text-xs truncate">{book.author}</p>
              )}
            </div>
          </div>

          {/* Toggle sidebar button (mobile) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-cream/10 rounded-full transition-colors md:hidden text-cream"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
        </div>

        {/* Quote indicator bar */}
        {highlightQuote && quoteLocation?.found && (
          <div className="bg-gold/10 border-b border-gold/20 px-4 py-2 flex items-center gap-2 flex-shrink-0">
            <span className="text-gold flex-shrink-0">📌</span>
            <p className="text-sm text-cream/80 truncate">
              Citation from Chapter {quoteLocation.chapter_number}
            </p>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold mx-auto mb-3" />
                <p className="text-cream/60 text-sm">Loading book...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center text-cream">
                <p className="text-lg mb-3">{error}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gold text-dark-bg text-sm rounded-lg hover:bg-gold/90 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          ) : book ? (
            <>
              {/* Chapter Sidebar */}
              <div
                className={`
                  ${sidebarOpen ? 'w-52 md:w-60' : 'w-0'}
                  bg-dark-bg/50 border-r border-gold/20 overflow-hidden transition-all duration-300
                  flex-shrink-0
                `}
              >
                <div className="w-52 md:w-60 h-full overflow-y-auto">
                  {/* Sidebar header */}
                  <div className="sticky top-0 bg-dark-bg/90 border-b border-gold/20 px-3 py-2">
                    <h2 className="text-xs font-semibold text-gold/80 uppercase tracking-wide">
                      Chapters
                    </h2>
                  </div>

                  {/* Chapter list */}
                  <div className="py-1">
                    {(book.chapters || []).map(chapter => (
                      <ChapterNavItem
                        key={chapter.id}
                        chapter={chapter}
                        level={0}
                        selectedChapterId={selectedChapterId}
                        onSelect={setSelectedChapterId}
                        quoteChapterId={quoteLocation?.found ? quoteLocation.chapter_id : undefined}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div
                ref={contentRef}
                className="flex-1 overflow-y-auto bg-dark-card"
              >
                {chapterContent ? (
                  <div className="max-w-2xl mx-auto px-6 py-6">
                    {/* Chapter header */}
                    <div className="mb-6 pb-4 border-b border-gold/20">
                      <span className="text-xs font-medium text-gold uppercase tracking-wide">
                        Chapter {chapterContent.chapter_number}
                      </span>
                      <h2 className="text-xl font-serif font-bold text-cream mt-1">
                        {chapterContent.title}
                      </h2>
                    </div>

                    {/* Chapter content */}
                    <div className="font-serif text-cream/90 text-lg leading-relaxed">
                      {renderContent()}
                    </div>

                    {/* Chapter navigation */}
                    <div className="mt-8 pt-6 border-t border-gold/20 flex justify-between">
                      <button
                        onClick={() => navigateChapter('prev')}
                        className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-sm font-medium">Previous</span>
                      </button>
                      <button
                        onClick={() => navigateChapter('next')}
                        className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors"
                      >
                        <span className="text-sm font-medium">Next</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center h-full">
                    <div className="text-center text-cream/60">
                      <span className="text-4xl mb-3 block">📖</span>
                      <p>Select a chapter to start reading</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer with keyboard hints */}
        <div className="bg-dark-bg border-t border-gold/20 px-4 py-2 text-xs text-cream/40 flex items-center justify-between flex-shrink-0">
          <span>Press ESC to close</span>
          <span className="hidden sm:inline">Use arrow keys to navigate</span>
        </div>
      </div>

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes pulse-twice {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-twice {
          animation: pulse-twice 1s ease-in-out 2;
        }
      `}</style>
    </div>
  );
}

// Chapter navigation item component
function ChapterNavItem({ chapter, level, selectedChapterId, onSelect, quoteChapterId }) {
  const [expanded, setExpanded] = useState(() => {
    if (chapter.id === quoteChapterId) return true;
    const hasQuoteChild = (items) => {
      return items.some(c => c.id === quoteChapterId || hasQuoteChild(c.children || []));
    };
    return hasQuoteChild(chapter.children || []);
  });

  const isSelected = chapter.id === selectedChapterId;
  const hasQuote = chapter.id === quoteChapterId;
  const hasChildren = (chapter.children || []).length > 0;
  const paddingLeft = level * 12 + 12;

  return (
    <div>
      <div
        className={`
          flex items-center gap-1 py-1.5 px-2 cursor-pointer transition-colors text-sm
          ${isSelected ? 'bg-gold/20 border-r-2 border-gold text-cream' : 'hover:bg-cream/5 text-cream/70'}
          ${hasQuote ? 'bg-gold/10' : ''}
        `}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={() => onSelect(chapter.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5 hover:bg-cream/10 rounded"
          >
            <svg
              className={`w-3 h-3 text-cream/50 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <span className="truncate flex-1" title={chapter.title}>
          <span className="font-medium text-gold/80">{chapter.chapter_number}.</span> {chapter.title}
        </span>

        {hasQuote && (
          <div className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0" />
        )}
      </div>

      {hasChildren && expanded && (
        <div>
          {chapter.children.map(child => (
            <ChapterNavItem
              key={child.id}
              chapter={child}
              level={level + 1}
              selectedChapterId={selectedChapterId}
              onSelect={onSelect}
              quoteChapterId={quoteChapterId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
