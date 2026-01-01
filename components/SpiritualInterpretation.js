'use client';

export default function SpiritualInterpretation({ interpretation, relevantPassages = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="bg-dark-card rounded-xl p-6 border border-gold/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-gold/20 loading-pulse" />
          <h3 className="text-lg font-semibold text-gold">Generating Spiritual Reflection...</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-cream/10 rounded loading-pulse" />
          <div className="h-4 bg-cream/10 rounded loading-pulse w-11/12" />
          <div className="h-4 bg-cream/10 rounded loading-pulse w-10/12" />
          <div className="h-4 bg-cream/10 rounded loading-pulse w-full" />
          <div className="h-4 bg-cream/10 rounded loading-pulse w-9/12" />
        </div>
        <p className="text-sm text-cream/50 mt-4 italic">
          Contemplating through the lens of Tafakkur...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-dark-card rounded-xl p-6 border border-gold/20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">&#9672;</span>
        <div>
          <h3 className="text-lg font-semibold text-gold">Spiritual Reflection</h3>
          <p className="text-xs text-cream/50">In the style of Maulana Wahiduddin Khan</p>
        </div>
      </div>

      {/* Interpretation */}
      <div className="spiritual-text text-cream/90 space-y-4">
        {interpretation.split('\n\n').map((paragraph, index) => (
          <p key={index} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Relevant Passages (if any) */}
      {relevantPassages.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gold/10">
          <h4 className="text-sm font-medium text-gold mb-4">Related Teachings</h4>
          <div className="space-y-3">
            {relevantPassages.map((passage, index) => (
              <blockquote key={index} className="text-sm text-cream/70 italic">
                "{passage.content}"
                <footer className="text-xs text-cream/50 mt-1 not-italic">
                  — From: <span className="text-gold/70">{passage.bookName || passage.source}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gold/10 flex items-center justify-between">
        <p className="text-xs text-cream/40">
          Generated through Tafakkur (contemplation) and Tadabbur (reflection)
        </p>
        <div className="flex items-center gap-1 text-gold/50">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs">AI-assisted interpretation</span>
        </div>
      </div>
    </div>
  );
}
