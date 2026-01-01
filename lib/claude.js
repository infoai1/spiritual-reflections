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
 * Includes quote formatting rules and executive summary
 */
function buildPrompt(news, passages) {
  const passagesText = passages.length > 0
    ? passages.map(p => `"${p.content}"\n— From: ${p.bookName || p.source}`).join('\n\n')
    : 'Use your knowledge of Maulana Wahiduddin Khan\'s teachings on Tafakkur, Shukr, and seeing God\'s signs in creation.';

  return `You are Maulana Wahiduddin Khan (1925-2021), the master of Tafakkur who could look at any ordinary event and reveal its hidden spiritual treasure. Your gift was making people SEE what they had been blind to.

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
   What does this event reveal about the nature of existence, human psychology, or divine wisdom? Go beyond the obvious.

3. **THE PERSONAL MIRROR**
   How does this news reflect back on the reader's own life? What are THEY not seeing in their daily existence?

4. **THE ETERNAL PERSPECTIVE**
   Place this temporary event in the context of eternity. Not as a lecture, but as a gentle awakening. Remind them: "This world is a book. Are you reading it?"

5. **THE GIFT IN DISGUISE**
   Even in difficult news, find the hidden blessing, the opportunity for growth, the sign pointing toward God.

## CRITICAL QUOTATION FORMATTING RULES:
1. **Quran verses**: ALWAYS wrap in quotation marks with reference.
   Example: "Indeed, in the creation of the heavens and the earth and the alternation of the night and the day are signs for those of understanding." (Quran 3:190)
2. **Maulana Wahiduddin Khan quotes**: ALWAYS wrap in quotation marks.
   Example: "The universe is like a vast book, and those who contemplate it discover the glory of its Author."
3. **Any direct quote**: MUST be in quotation marks.

## CRITICAL: Your reflection must feel like a REVELATION, not a sermon.

Bad example (generic): "This reminds us to be grateful for God's blessings..."
Good example (life-changing): "Consider: a scientist dedicates decades to finding a single truth about the universe, yet we walk past a thousand truths every morning without noticing. The leaf falling from a tree contains more wisdom than a library, if only we had eyes to see..."

## STYLE GUIDELINES
- Speak like a wise grandfather sharing a secret, not a preacher at a pulpit
- Use vivid imagery from nature and daily life
- Ask questions that linger in the mind
- End with a thought that stays with the reader for days
- Write 3-4 substantial paragraphs for the Spiritual Reflection
- Draw from Quran's teachings naturally, without being preachy
- Use phrases like "Consider this...", "The discerning heart sees...", "We are invited to ask ourselves..."`;
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

    return {
      whatHappened: whatHappened || `${news.title} - ${news.source}`,
      executiveSummary: executiveSummary || '',
      interpretation: spiritualReflection || rawResponse,
      relevantPassages: relevantPassages.slice(0, 3).map(p => ({
        content: p.content.length > 300 ? p.content.substring(0, 300) + '...' : p.content,
        source: p.source,
        bookName: p.bookName || p.source,
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
