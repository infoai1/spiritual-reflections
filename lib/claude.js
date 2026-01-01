/**
 * Spiritual Interpretation Generation via LightRAG
 * Generates spiritual interpretations in Maulana Wahiduddin Khan's style
 * Uses LightRAG API which has all of Maulana's books indexed
 */

import { searchKnowledgeBase, getSampleTeachings } from './knowledge-base';

const LIGHTRAG_URL = 'http://localhost:9621/query';

/**
 * System prompt that defines Maulana's interpretation style
 */
const INTERPRETATION_STYLE = `You are a spiritual guide interpreting news in the style of Maulana Wahiduddin Khan (1925-2021), the renowned Islamic scholar, spiritual guide, and founder of CPS International.

Your interpretation should:
1. See Signs (Ayat) - Every event is a sign from God
2. Evoke Gratitude (Shukr) - Connect to blessings we overlook
3. Remember the Hereafter (Akhirat) - This world is temporary
4. Encourage Reflection (Tadabbur) - Invite deep pondering
5. Find Universal Wisdom - Lessons for all humanity

Write in a gentle, wise, contemplative tone - never preachy. Use simple language that touches the heart. Length: 2-3 meaningful paragraphs.`;

/**
 * Generate a spiritual interpretation of a news article using LightRAG
 *
 * @param {Object} news - News article with title, description, content
 * @returns {Object} - { interpretation, relevantPassages }
 */
export async function generateInterpretation(news) {
  try {
    // Build the query for LightRAG
    const query = `Based on Maulana Wahiduddin Khan's teachings, provide a spiritual reflection on this news:

"${news.title}"

${news.description || ''} ${news.content || ''}

${INTERPRETATION_STYLE}`;

    // Call LightRAG for interpretation
    const response = await fetch(LIGHTRAG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        mode: 'mix',
        include_references: true,
        response_type: 'Multiple Paragraphs',
        top_k: 5,
      })
    });

    if (!response.ok) {
      throw new Error(`LightRAG returned ${response.status}`);
    }

    const result = await response.json();

    // Get relevant passages for display
    const relevantPassages = await searchKnowledgeBase(news.title, news.content || news.description);

    // Clean up the interpretation - remove markdown headers for cleaner display
    let interpretation = result.response || '';
    interpretation = interpretation
      .replace(/^###?\s+.*$/gm, '') // Remove headers
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
      .trim();

    return {
      interpretation,
      relevantPassages: relevantPassages.slice(0, 3).map(p => ({
        content: p.content.length > 300 ? p.content.substring(0, 300) + '...' : p.content,
        source: p.source,
        bookName: p.bookName || p.source,
      })),
    };
  } catch (error) {
    console.error('LightRAG interpretation error:', error);

    // Return a fallback interpretation
    return {
      interpretation: generateFallbackInterpretation(news),
      relevantPassages: getSampleTeachings().slice(0, 3).map(p => ({
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
  return `This news invites us to pause and reflect on the deeper meaning behind worldly events. As Maulana Wahiduddin Khan taught, every happening in this universe is a sign (Ayah) from the Creator, waiting to be understood by those who contemplate.

The development reported in "${news.title}" reminds us of both the blessings we enjoy and the greater purpose of our existence. In the words of Maulana, "The universe is like a vast book, and those who contemplate it discover the glory of its Author."

Let this news be an occasion for gratitude (Shukr) and deeper awareness. May it turn our hearts toward the eternal truths and remind us that while we engage with the affairs of this temporary world, our ultimate destination is the Hereafter (Akhirat). This awareness, when it fills our hearts, transforms ordinary news into extraordinary spiritual nourishment.`;
}

/**
 * Check if LightRAG API is configured and available
 */
export async function isConfigured() {
  try {
    const response = await fetch('http://localhost:9621/health');
    return response.ok;
  } catch {
    return false;
  }
}
