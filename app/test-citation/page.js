'use client';

import { useState } from 'react';
import CitationPanel from '@/components/CitationPanel';

// Sample book JSON matching annotation tool export format
const sampleBookJson = {
  book_metadata: {
    title: "Peace in Kashmir",
    author: "Maulana Wahiduddin Khan",
    slug: "peace-in-kashmir",
    total_chapters: 4,
    total_paragraphs: 16,
    total_groups: 4
  },
  groups: [
    {
      group_id: "g_001",
      para_ids: ["p_009", "p_010", "p_011"],
      combined_text: "Introduction\n\nI HAVE BEEN writing about Kashmir since 1968. From the very outset I have been of the firm view that unrealistic politics has played havoc with Kashmir, but that now through realistic politics we can once again lead Kashmir to progress and development. Kashmiri Muslims have today become disillusioned. They are living in an atmosphere of mistrust.",
      token_count: 85,
      chapter: "Introduction",
      page_start: 3,
      page_end: 3
    },
    {
      group_id: "g_002",
      para_ids: ["p_012", "p_013"],
      combined_text: "The aim of this book is to assist them to emerge from the disillusionment, and to start afresh with new-found courage and confidence. It is indeed possible for the Kashmiris to start a new life at any given time, but for this, two conditions must be met.",
      token_count: 65,
      chapter: "Introduction",
      page_start: 3,
      page_end: 4
    },
    {
      group_id: "g_003",
      para_ids: ["p_014", "p_015", "p_016"],
      combined_text: "Kashmiri Leadership\n\nI HAVE BEEN thinking of the issue of Kashmir since its beginning. By the grace of God, the view I initially formed on this issue appears correct to me even today. I have never felt the need to change it.",
      token_count: 55,
      chapter: "Kashmiri Leadership",
      page_start: 5,
      page_end: 5
    },
    {
      group_id: "g_004",
      para_ids: ["p_017", "p_018"],
      combined_text: "Lessons from Nature\n\nTHE ARMED UPRISING in Kashmir against India began in October 1989. Just a month before this, I visited Kashmir, where I had to address a large gathering at the Tagore Hall in Srinagar.",
      token_count: 50,
      chapter: "Lessons from Nature",
      page_start: 8,
      page_end: 8
    }
  ],
  structure: []
};

export default function TestCitationPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('g_001');
  const [searchText, setSearchText] = useState('unrealistic politics');

  return (
    <div className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gold mb-2">Book Components Test</h1>
        <p className="text-cream/60 mb-6">Test CitationPanel (modal) and BookReader (full page)</p>

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-cream/80 text-sm mb-2">Group ID:</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-dark-card border border-gold/30 rounded px-3 py-2 text-cream"
            >
              {sampleBookJson.groups.map(g => (
                <option key={g.group_id} value={g.group_id}>
                  {g.group_id} - {g.chapter}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-cream/80 text-sm mb-2">Search Text (to highlight):</label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-dark-card border border-gold/30 rounded px-3 py-2 text-cream"
              placeholder="Text to highlight..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="bg-gold text-dark-bg font-bold py-3 px-4 rounded-lg hover:bg-gold/90 transition-colors"
            >
              Open CitationPanel
            </button>

            <a
              href="/read/peace-in-kashmir-book"
              className="bg-cream/10 text-cream font-bold py-3 px-4 rounded-lg hover:bg-cream/20 transition-colors text-center"
            >
              Open BookReader
            </a>
          </div>
        </div>

        <div className="bg-dark-card rounded-lg p-4 border border-gold/20">
          <h2 className="text-sm font-semibold text-gold mb-2">Sample Data Preview:</h2>
          <pre className="text-xs text-cream/60 overflow-x-auto">
            {JSON.stringify(sampleBookJson.groups.find(g => g.group_id === selectedGroup), null, 2)}
          </pre>
        </div>

        <div className="mt-6 p-4 bg-cream/5 rounded-lg border border-cream/10">
          <h3 className="text-sm font-semibold text-cream/80 mb-2">Component Architecture:</h3>
          <pre className="text-xs text-cream/50">
{`BookViewer (core)
  ├── CitationPanel (modal wrapper)
  └── BookReader (full page + TOC)

/read/[slug] → BookReader`}
          </pre>
        </div>
      </div>

      <CitationPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        groupId={selectedGroup}
        searchText={searchText}
        bookJson={sampleBookJson}
        pdfUrl="/books/peace-in-kashmir-book.pdf"
      />
    </div>
  );
}
