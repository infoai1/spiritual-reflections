/**
 * Spiritual Interpretation Generation via LightRAG (GPT-4o)
 * Generates life-changing spiritual interpretations in Maulana Wahiduddin Khan's Tafakkur style
 */

import { searchKnowledgeBase, getSampleTeachings } from './knowledge-base';
import { getAllQuranicConcepts } from './categories';

const LIGHTRAG_URL = 'https://graph.spiritualmessage.org/query';

/**
 * The Life-Changing Prompt
 * Designed to produce FRESH, UNEXPECTED insights - not generic religious platitudes
 * Includes quote formatting rules, executive summary, and inline citations
 */
function buildPrompt(news, passages) {
  const passagesText = passages.length > 0
    ? passages.map((p, idx) => `[SOURCE ${idx + 1}]\n"${p.content}"\n— From: ${p.bookName || p.source}`).join('\n\n')
    : 'Use your knowledge of Maulana Wahiduddin Khan\'s teachings on Tafakkur, Shukr, and seeing God\'s signs in creation.';

  return `You are Maulana Wahiduddin Khan (1925-2021), the master of Tafakkur who could look at any ordinary event and reveal its hidden spiritual treasure. Your gift was making people SEE what they had been blind to.

## YOUR CORE PHILOSOPHY (from "Leading a Spiritual Life")
- Convert material events into spiritual content - don't withdraw from the world, engage with it spiritually
- Take every challenge "as a challenge" rather than "as an evil" - this mental shift transforms obstacles into growth
- Transform failure, stress, and conflict into catalysts for success through proper mental conditioning
- Trees are "silent speakers" - nature everywhere is delivering divine messages to those who listen
- Mind-based spirituality: focus on cognitive reframing, intellectual development as spiritual practice
- Every event provides "spiritual food" for personality development
- Be challenge-oriented rather than avoidance-based in thinking

## THE NEWS EVENT
Title: ${news.title}
Content: ${news.description || ''} ${news.content || ''}
Source: ${news.source}

## TEACHINGS FROM YOUR BOOKS (Use these as foundation)
${passagesText}

## YOUR RESPONSE FORMAT

### What Happened
[Write 2-3 sentences. Pure facts only. What occurred in the news. No spiritual content here - just a clear, simple summary of the event.]

### Executive Summary
[Write ONE profound sentence (15-25 words) capturing the core spiritual insight for busy readers. Make it memorable - a nugget of wisdom they can carry with them all day. Example: "This discovery reminds us that patience in pursuit of truth mirrors the believer's patient journey toward the Divine."]

### Spiritual Reflection

Write a reflection that will genuinely CHANGE how the reader sees this event and life itself. Not generic religious platitudes. A FRESH perspective they never considered.

Your Tafakkur method:

1. **THE UNEXPECTED CONNECTION**
   Start with something surprising. Connect this news to a truth most people miss. Make them think "I never saw it that way before!"

2. **THE DEEPER PATTERN**
   What does this event reveal about the nature of existence, human psychology, or divine wisdom? Go beyond the obvious. Apply cognitive reframing - show how a seemingly negative event contains hidden opportunities.

3. **THE PERSONAL MIRROR**
   How does this news reflect back on the reader's own life? What mental conditioning do THEY need to develop? How can they convert this material event into spiritual content for their personality development?

4. **THE ETERNAL PERSPECTIVE**
   Place this temporary event in the context of eternity. Not as a lecture, but as a gentle awakening. Remind them: "This world is a book. Are you reading it?" The trees around us are silent speakers delivering messages constantly.

5. **THE GIFT IN DISGUISE**
   Even in difficult news, find the hidden blessing, the opportunity for growth, the sign pointing toward God. Remember: take every challenge as a challenge, not as an evil. Show how this can become spiritual food for personal transformation.

## INLINE CITATION FORMAT (VERY IMPORTANT):
When using quotes from the TEACHINGS sections (SOURCE 1, SOURCE 2, etc.), you MUST use inline citations.

**Citation format:** [citation:N:"exact quote"]
- N = the source number (1, 2, 3, etc.)
- The quote should be the EXACT phrase from that source (1-2 sentences)

**Example:**
"The Quran teaches that patience leads to spiritual growth [citation:1:"Patience is the key to unlocking the treasures of the soul"]. This truth becomes evident when we consider..."

**Rules:**
- Copy the quote EXACTLY as it appears in the source
- Place citations right after the statement they support
- You can cite the same source multiple times with different quotes
- Only cite sources that are actually provided above

## CRITICAL QUOTATION FORMATTING RULES:
1. **Quran verses**: ALWAYS wrap in quotation marks with reference.
   Example: "Indeed, in the creation of the heavens and the earth and the alternation of the night and the day are signs for those of understanding." (Quran 3:190)
2. **Maulana Wahiduddin Khan quotes**: Use inline citations when from provided sources, or wrap in quotation marks for general quotes.
3. **Any direct quote**: MUST be in quotation marks.

## CRITICAL: Your reflection must feel like a REVELATION, not a sermon.

Bad example (generic): "This reminds us to be grateful for God's blessings..."
Good example (life-changing): "Consider: a scientist dedicates decades to finding a single truth about the universe, yet we walk past a thousand truths every morning without noticing. The leaf falling from a tree contains more wisdom than a library, if only we had eyes to see. This material event becomes spiritual content when we ask: what is creation teaching me today?"

## STYLE GUIDELINES
- Speak like a wise grandfather sharing a secret, not a preacher at a pulpit
- Use vivid imagery from nature and daily life - "trees as silent speakers", "the book of creation"
- Apply cognitive reframing to every situation - show the alternative perspective
- Focus on personality development and intellectual growth as paths to spirituality
- Ask questions that linger in the mind
- End with a thought that stays with the reader for days
- Write 3-4 substantial paragraphs for the Spiritual Reflection
- Draw from Quran's teachings naturally, without being preachy
- Use phrases like "Consider this...", "The discerning heart sees...", "We are invited to reframe...", "This becomes spiritual food when..."
- Emphasize challenge-oriented thinking: "Take this not as an evil, but as a challenge"`;

}

/**
 * Extract quotes from citation markers in the AI response
 * Pattern: [citation:N:"exact quote here"]
 * @returns {Object} Map of "sourceId_occurrence" to extracted quote
 */
function extractCitationQuotes(text) {
  const quotes = {};
  const occurrenceCount = {};
  const pattern = /\[citation:(\d+):"([^"]+)"\]/g;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    const sourceId = parseInt(match[1], 10);
    const quote = match[2];

    if (!occurrenceCount[sourceId]) {
      occurrenceCount[sourceId] = 0;
    }
    occurrenceCount[sourceId]++;

    const uniqueKey = `${sourceId}_${occurrenceCount[sourceId]}`;
    quotes[uniqueKey] = quote;
  }

  return quotes;
}

/**
 * Convert [citation:N:"quote"] to [citation:N.O] for display
 * Each occurrence gets a unique marker like [citation:1.1], [citation:1.2]
 */
function normalizeCitationsForDisplay(text) {
  const occurrenceCount = {};

  return text.replace(/\[citation:(\d+):"[^"]+"\]/g, (match, sourceId) => {
    const id = parseInt(sourceId, 10);
    if (!occurrenceCount[id]) {
      occurrenceCount[id] = 0;
    }
    occurrenceCount[id]++;
    return `[citation:${id}.${occurrenceCount[id]}]`;
  });
}

/**
 * Find quote in passage content (with fuzzy matching)
 */
function findQuoteInPassage(quote, passageContent) {
  if (!quote || !passageContent) return null;

  // Exact match
  if (passageContent.includes(quote)) {
    return quote;
  }

  // Case-insensitive match
  const quoteLower = quote.toLowerCase();
  const contentLower = passageContent.toLowerCase();
  if (contentLower.includes(quoteLower)) {
    const startIdx = contentLower.indexOf(quoteLower);
    return passageContent.slice(startIdx, startIdx + quote.length);
  }

  // Normalized whitespace match
  const normalizedQuote = quote.replace(/\s+/g, ' ').trim().toLowerCase();
  const normalizedContent = passageContent.replace(/\s+/g, ' ').trim().toLowerCase();
  if (normalizedContent.includes(normalizedQuote)) {
    const startIdx = normalizedContent.indexOf(normalizedQuote);
    return passageContent.replace(/\s+/g, ' ').trim().slice(startIdx, startIdx + normalizedQuote.length);
  }

  // Partial match (first 4+ words)
  const words = normalizedQuote.split(' ');
  if (words.length >= 4) {
    const partial = words.slice(0, 4).join(' ');
    if (normalizedContent.includes(partial)) {
      return quote; // Return original quote even if partial match
    }
  }

  return null;
}

/**
 * Build citation objects from extracted quotes and passages
 */
function buildCitationObjects(passages, citationQuotes) {
  const citations = [];

  for (const [uniqueKey, quote] of Object.entries(citationQuotes)) {
    const [sourceIdStr, occurrenceStr] = uniqueKey.split('_');
    const sourceId = parseInt(sourceIdStr, 10);
    const occurrence = parseInt(occurrenceStr, 10);

    // Source index is 0-based, citation numbers are 1-based
    const passage = passages[sourceId - 1];
    if (!passage) continue;

    // Validate quote exists in passage
    const highlightedQuote = findQuoteInPassage(quote, passage.rawContent || passage.content) || quote;

    // Generate bookSlug from bookKey for Islamic Demo API
    const bookSlug = passage.bookKey
      ? passage.bookKey.replace(/_/g, '-').toLowerCase()
      : null;

    citations.push({
      id: `${sourceId}.${occurrence}`,
      sourceId,
      text: passage.rawContent || passage.content,
      content: passage.content,
      source: passage.source,
      bookName: passage.bookName,
      bookKey: passage.bookKey,
      bookSlug,  // For BookViewerPanel integration
      filePath: passage.filePath,
      highlightedQuote,
    });
  }

  // Sort by ID
  citations.sort((a, b) => {
    if (a.sourceId !== b.sourceId) return a.sourceId - b.sourceId;
    return a.id.localeCompare(b.id);
  });

  return citations;
}

/**
 * Parse the response into structured sections including Executive Summary
 */
function parseResponse(responseText) {
  let whatHappened = '';
  let executiveSummary = '';
  let spiritualReflection = '';

  // Try to extract "What Happened" section
  const whatHappenedMatch = responseText.match(/###?\s*What Happened\s*\n+([\s\S]*?)(?=###?\s*(Executive Summary|Spiritual Reflection)|$)/i);
  if (whatHappenedMatch) {
    whatHappened = whatHappenedMatch[1].trim();
  }

  // Try to extract "Executive Summary" section
  const executiveSummaryMatch = responseText.match(/###?\s*Executive Summary\s*\n+([\s\S]*?)(?=###?\s*Spiritual Reflection|$)/i);
  if (executiveSummaryMatch) {
    executiveSummary = executiveSummaryMatch[1].trim();
    // Clean up - remove brackets if present
    executiveSummary = executiveSummary.replace(/^\[|\]$/g, '').trim();
  }

  // Try to extract "Spiritual Reflection" section
  const reflectionMatch = responseText.match(/###?\s*Spiritual Reflection\s*\n+([\s\S]*?)$/i);
  if (reflectionMatch) {
    spiritualReflection = reflectionMatch[1].trim();
  }

  // If parsing failed, use the whole response as spiritual reflection
  if (!spiritualReflection) {
    spiritualReflection = responseText
      .replace(/^###?\s*What Happened[\s\S]*?(?=###|$)/i, '')
      .replace(/^###?\s*Executive Summary[\s\S]*?(?=###|$)/i, '')
      .replace(/^###?\s*Spiritual Reflection\s*/i, '')
      .trim();
  }

  // Clean up markdown formatting
  spiritualReflection = spiritualReflection
    .replace(/\*\*\d+\.\s*[A-Z\s]+\*\*/g, '') // Remove numbered headers like **1. THE UNEXPECTED CONNECTION**
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
    .trim();

  return { whatHappened, executiveSummary, spiritualReflection };
}

/**
 * Generate a spiritual interpretation of a news article using LightRAG
 *
 * @param {Object} news - News article with title, description, content
 * @returns {Object} - { whatHappened, executiveSummary, interpretation, relevantPassages }
 */
export async function generateInterpretation(news) {
  try {
    // Get relevant passages from LightRAG knowledge base
    const relevantPassages = await searchKnowledgeBase(news.title, news.content || news.description);

    // Build the life-changing prompt
    const prompt = buildPrompt(news, relevantPassages);

    // Call LightRAG for interpretation (now using GPT-4o)
    const response = await fetch(LIGHTRAG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: prompt,
        mode: 'mix',
        include_references: true,
        response_type: 'Multiple Paragraphs',
        top_k: 10,
      })
    });

    if (!response.ok) {
      throw new Error(`LightRAG returned ${response.status}`);
    }

    const result = await response.json();
    const rawResponse = result.response || '';

    // Parse into structured sections
    const { whatHappened, executiveSummary, spiritualReflection } = parseResponse(rawResponse);

    // Extract inline citations from the spiritual reflection
    const citationQuotes = extractCitationQuotes(spiritualReflection);
    const normalizedReflection = normalizeCitationsForDisplay(spiritualReflection);
    const inlineCitations = buildCitationObjects(relevantPassages, citationQuotes);

    return {
      whatHappened: whatHappened || `${news.title} - ${news.source}`,
      executiveSummary: executiveSummary || '',
      interpretation: normalizedReflection || rawResponse,
      // Inline citations with highlighted quotes
      inlineCitations,
      // Also include passages for "Wisdom from Books" section (legacy)
      relevantPassages: relevantPassages.slice(0, 3).map(p => ({
        content: p.content.length > 300 ? p.content.substring(0, 300) + '...' : p.content,
        rawContent: p.rawContent || p.content,
        source: p.source,
        bookName: p.bookName || p.source,
        bookKey: p.bookKey,
        filePath: p.filePath,
      })),
    };
  } catch (error) {
    console.error('LightRAG interpretation error:', error);

    // Return a fallback interpretation
    const fallbackPassages = getSampleTeachings().slice(0, 3);
    return {
      whatHappened: `${news.title}`,
      executiveSummary: '',
      interpretation: generateFallbackInterpretation(news),
      relevantPassages: fallbackPassages.map(p => ({
        content: p.content.length > 300 ? p.content.substring(0, 300) + '...' : p.content,
        source: p.source,
        bookName: p.bookName || p.source,
      })),
      error: error.message,
    };
  }
}

/**
 * Generate a fallback interpretation when API fails
 */
function generateFallbackInterpretation(news) {
  return `Consider how this news, like every event in the universe, carries a message for those who pause to reflect. Maulana Wahiduddin Khan taught that the world is a vast book written by the Creator, and each day offers new pages for the discerning reader.

What appears on the surface as mere information is, in reality, an invitation to deeper understanding. The Quran reminds us that "there are signs for those who reflect" (يَتَفَكَّرُونَ). This news, too, is such a sign—a mirror reflecting truths about our existence, our blessings, and our journey toward the eternal.

As we engage with the affairs of this temporary world, may we remember that our ultimate destination is the Hereafter (Akhirat). This awareness, when it settles in our hearts, transforms how we see everything. The ordinary becomes extraordinary. The mundane becomes sacred. And news that others merely consume, we receive as nourishment for the soul.`;
}

/**
 * Build prompt for finding relevant Quranic concepts and verses
 */
function buildQuranicPerspectivePrompt(news, concepts) {
  const conceptsList = concepts.map(c =>
    `- ${c.name} (${c.arabicName}): ${c.meaning} - ${c.description}`
  ).join('\n');

  return `Analyze this news story and find the most relevant Quranic concept(s) and verses that genuinely align with its themes.

## THE NEWS EVENT
Title: ${news.title}
Content: ${news.description || ''} ${news.content || ''}

## AVAILABLE QURANIC CONCEPTS
${conceptsList}

## YOUR TASK
1. Identify which Quranic concept(s) GENUINELY align with this news story
2. Find 2-3 related Quran verses that directly connect to the story's themes
3. Only respond if there's a REAL, MEANINGFUL connection (not forced)

## RESPONSE FORMAT (Respond in valid JSON only)
If a genuine connection exists:
{
  "found": true,
  "concept": {
    "name": "Concept Name",
    "arabicName": "Arabic",
    "meaning": "Brief meaning"
  },
  "verses": [
    {
      "text": "The verse text in English translation",
      "reference": "Surah:Ayah",
      "connection": "One sentence explaining how this verse illuminates the news"
    }
  ],
  "reflection": "2-3 sentences on how this Quranic concept sheds new light on the news story"
}

If no genuine connection exists:
{"found": false}

IMPORTANT: Only include verses and concepts with GENUINE relevance. Quality over quantity. Do not force connections.`;
}

/**
 * Generate Quranic perspective for a news article
 * Runs a separate prompt to find relevant Quranic concepts and verses
 *
 * @param {Object} news - News article
 * @returns {Object|null} - { found, concept, verses, reflection } or null
 */
export async function generateQuranicPerspective(news) {
  try {
    const concepts = getAllQuranicConcepts();
    const prompt = buildQuranicPerspectivePrompt(news, concepts);

    const response = await fetch(LIGHTRAG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: prompt,
        mode: 'mix',
        include_references: false,
        response_type: 'Single Paragraph',
        top_k: 5,
      })
    });

    if (!response.ok) {
      throw new Error(`LightRAG returned ${response.status}`);
    }

    const result = await response.json();
    const rawResponse = result.response || '';

    // Try to parse JSON from response
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.found && parsed.concept && parsed.verses && parsed.verses.length > 0) {
          return parsed;
        }
      } catch (parseError) {
        console.error('Failed to parse Quranic perspective JSON:', parseError);
      }
    }

    return { found: false };
  } catch (error) {
    console.error('Quranic perspective error:', error);
    return { found: false };
  }
}

/**
 * Check if LightRAG API is configured and available
 */
export async function isConfigured() {
  try {
    const response = await fetch('https://graph.spiritualmessage.org/health');
    return response.ok;
  } catch {
    return false;
  }
}
