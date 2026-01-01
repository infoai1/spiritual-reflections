'use client';

export default function SpiritualInterpretation({
  whatHappened,
  executiveSummary,
  interpretation,
  relevantPassages = [],
  quranicPerspective = null,
  isLoading = false,
  fromCache = false
}) {
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
    <div className="space-y-6">
      {/* What Happened Section */}
      {whatHappened && (
        <div className="bg-dark-card/50 rounded-xl p-5 border border-cream/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">&#128240;</span>
            <h3 className="text-sm font-medium text-cream/70 uppercase tracking-wide">What Happened</h3>
          </div>
          <p className="text-cream/90 leading-relaxed">
            {whatHappened}
          </p>
        </div>
      )}

      {/* Executive Summary Section - "In Brief" */}
      {executiveSummary && (
        <div className="bg-gold/5 rounded-xl p-5 border border-gold/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">&#128161;</span>
            <h3 className="text-sm font-medium text-gold uppercase tracking-wide">In Brief</h3>
          </div>
          <p className="text-cream font-medium text-lg leading-relaxed spiritual-text italic">
            "{executiveSummary}"
          </p>
        </div>
      )}

      {/* Spiritual Reflection Section */}
      <div className="bg-dark-card rounded-xl p-6 border border-gold/20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">&#10022;</span>
          <div>
            <h3 className="text-lg font-semibold text-gold">Spiritual Reflection</h3>
            <p className="text-xs text-cream/50">In the style of Maulana Wahiduddin Khan</p>
          </div>
        </div>

        {/* Interpretation */}
        <div className="spiritual-text text-cream/90 space-y-4">
          {interpretation.split('\n\n').map((paragraph, index) => (
            <p key={index} className="leading-relaxed text-[1.05rem]">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Related Teachings (if any) */}
        {relevantPassages.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gold/10">
            <h4 className="text-sm font-medium text-gold mb-4 flex items-center gap-2">
              <span>&#128214;</span> Wisdom from Maulana's Books
            </h4>
            <div className="space-y-4">
              {relevantPassages.map((passage, index) => (
                <blockquote key={index} className="passage-text text-cream/70 border-l-2 border-gold/30 pl-4">
                  "{passage.content}"
                  <footer className="text-xs text-cream/50 mt-2 not-italic">
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
          <div className="flex items-center gap-2">
            {fromCache && (
              <span className="text-xs text-cream/30 bg-cream/5 px-2 py-1 rounded">
                Cached
              </span>
            )}
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
      </div>

      {/* Quranic Perspective Section (if found) */}
      {quranicPerspective && quranicPerspective.found && (
        <div className="bg-dark-card rounded-xl p-6 border border-gold/30">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">&#128220;</span>
            <div>
              <h3 className="text-lg font-semibold text-gold">Quranic Perspective</h3>
              {quranicPerspective.concept && (
                <p className="text-sm text-cream/60">
                  <span className="text-gold">{quranicPerspective.concept.name}</span>
                  {quranicPerspective.concept.arabicName && (
                    <span className="mx-2 text-cream/40">({quranicPerspective.concept.arabicName})</span>
                  )}
                  <span className="text-cream/50">— {quranicPerspective.concept.meaning}</span>
                </p>
              )}
            </div>
          </div>

          {/* Reflection text */}
          {quranicPerspective.reflection && (
            <p className="text-cream/80 leading-relaxed mb-6 spiritual-text italic">
              {quranicPerspective.reflection}
            </p>
          )}

          {/* Related verses */}
          {quranicPerspective.verses && quranicPerspective.verses.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gold/80">Related Verses</h4>
              {quranicPerspective.verses.map((verse, index) => (
                <div key={index} className="bg-dark-bg/50 rounded-lg p-4 border border-gold/10">
                  <blockquote className="quran-verse text-cream/90 leading-relaxed">
                    "{verse.text}"
                  </blockquote>
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-gold text-sm font-medium">— Quran {verse.reference}</span>
                    {verse.connection && (
                      <span className="text-cream/50 text-xs sm:text-right sm:max-w-[60%]">
                        {verse.connection}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
