'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BookViewer from './BookViewer';

/**
 * TOC Sidebar Item
 */
function TocItem({ chapter, isActive, isCurrentChapter, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
        ${isActive
          ? 'bg-gold/20 text-gold font-medium'
          : isCurrentChapter
            ? 'bg-cream/5 text-cream/80'
            : 'text-cream/60 hover:bg-cream/5 hover:text-cream/80'}
      `}
    >
      <span className="block truncate">{chapter.name}</span>
      {chapter.groupCount > 1 && (
        <span className="text-xs text-cream/40">
          {chapter.groupCount} sections
        </span>
      )}
    </button>
  );
}

/**
 * BookReader - Full page book reader with TOC sidebar
 *
 * Displays the complete book with table of contents navigation.
 * Used for dedicated reading experience at /read/[slug]
 *
 * @param {Object} bookJson - Full annotation tool export JSON
 * @param {string} initialGroupId - Optional starting group
 * @param {string} pdfUrl - Optional PDF download URL
 */
export default function BookReader({
  bookJson,
  initialGroupId,
  pdfUrl
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initialize with first group if not specified
  const [currentGroupId, setCurrentGroupId] = useState(() => {
    if (initialGroupId) return initialGroupId;
    if (bookJson?.groups?.length > 0) return bookJson.groups[0].group_id;
    return null;
  });

  // Get current group
  const currentGroup = useMemo(() => {
    if (!bookJson?.groups || !currentGroupId) return null;
    return bookJson.groups.find(g => g.group_id === currentGroupId);
  }, [bookJson, currentGroupId]);

  // Build chapters list from groups
  const chapters = useMemo(() => {
    if (!bookJson?.groups) return [];

    const chapterMap = new Map();
    bookJson.groups.forEach(g => {
      if (!chapterMap.has(g.chapter)) {
        chapterMap.set(g.chapter, {
          name: g.chapter,
          firstGroupId: g.group_id,
          groupCount: 1
        });
      } else {
        chapterMap.get(g.chapter).groupCount++;
      }
    });

    return Array.from(chapterMap.values());
  }, [bookJson]);

  // Handle group navigation
  const handleGroupChange = useCallback((newGroupId) => {
    setCurrentGroupId(newGroupId);
  }, []);

  // Jump to chapter
  const jumpToChapter = useCallback((chapterName) => {
    const chapter = chapters.find(c => c.name === chapterName);
    if (chapter) {
      setCurrentGroupId(chapter.firstGroupId);
      // Close sidebar on mobile after selection
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    }
  }, [chapters]);

  // Go back
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const bookTitle = bookJson?.book_metadata?.title || 'Book';
  const bookAuthor = bookJson?.book_metadata?.author || 'Maulana Wahiduddin Khan';

  if (!bookJson) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center text-cream/60">
          <span className="text-4xl mb-3 block">📖</span>
          <p>Book not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      {/* Top Header */}
      <header className="bg-dark-card border-b border-gold/30 px-4 py-3 flex items-center gap-3 flex-shrink-0 z-10">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="p-2 hover:bg-cream/10 rounded-full transition-colors flex-shrink-0 text-cream"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Book title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gold truncate">{bookTitle}</h1>
          <p className="text-cream/60 text-xs truncate">{bookAuthor}</p>
        </div>

        {/* Menu toggle (mobile) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-cream/10 rounded-full transition-colors text-cream md:hidden"
          aria-label="Toggle table of contents"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>

        {/* PDF button (desktop) */}
        {pdfUrl && (
          <button
            onClick={() => window.open(pdfUrl, '_blank')}
            className="hidden md:flex items-center gap-2 px-3 py-2 bg-gold/10 hover:bg-gold/20 rounded-lg text-gold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-sm font-medium">PDF</span>
          </button>
        )}
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* TOC Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? 'w-64 md:w-72' : 'w-0'}
            bg-dark-card border-r border-gold/20 flex-shrink-0
            transition-all duration-300 overflow-hidden
            absolute md:relative inset-y-0 left-0 z-20 md:z-0
            pt-16 md:pt-0
          `}
        >
          <div className="w-64 md:w-72 h-full flex flex-col">
            {/* Sidebar header */}
            <div className="px-4 py-3 border-b border-gold/20 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gold uppercase tracking-wide">
                Contents
              </h2>
              <span className="text-xs text-cream/40">
                {chapters.length} chapters
              </span>
            </div>

            {/* Chapter list */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
              {chapters.map((chapter) => (
                <TocItem
                  key={chapter.name}
                  chapter={chapter}
                  isActive={currentGroup?.chapter === chapter.name && chapter.firstGroupId === currentGroupId}
                  isCurrentChapter={currentGroup?.chapter === chapter.name}
                  onClick={() => jumpToChapter(chapter.name)}
                />
              ))}
            </nav>

            {/* Mobile PDF button */}
            {pdfUrl && (
              <div className="p-3 border-t border-gold/20 md:hidden">
                <button
                  onClick={() => window.open(pdfUrl, '_blank')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gold/10 hover:bg-gold/20 rounded-lg text-gold transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Download PDF</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Book content */}
        <main className="flex-1 overflow-hidden">
          <BookViewer
            bookJson={bookJson}
            currentGroupId={currentGroupId}
            onGroupChange={handleGroupChange}
            showNav={true}
            pdfUrl={null} // PDF button is in header
            className="h-full"
          />
        </main>
      </div>
    </div>
  );
}
