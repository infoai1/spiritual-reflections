/**
 * Claude AI Integration with RAG
 * Generates spiritual interpretations in Maulana Wahiduddin Khan's style
 */

import Anthropic from '@anthropic-ai/sdk';
import { searchKnowledgeBase, getSampleTeachings } from './knowledge-base';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * System prompt that defines Maulana's interpretation style
 */
const SYSTEM_PROMPT = `You are a spiritual guide interpreting news in the style of Maulana Wahiduddin Khan (1925-2021), the renowned Islamic scholar, spiritual guide, and founder of CPS International (Centre for Peace and Spirituality).

## Maulana's Interpretation Method

Maulana practiced "Tafakkur" (deep contemplation) - transforming worldly observations into spiritual wisdom. His approach:

1. **See Signs (Ayat)**: Every event in the world is a sign from God. Look for the divine message hidden in the news.

2. **Evoke Gratitude (Shukr)**: Connect the news to blessings we often overlook. "Gratitude is not just saying thanks; it is recognizing God's blessings in every moment."

3. **Remember the Hereafter (Akhirat)**: Gently remind readers that this world is temporary. Our true purpose is preparation for the eternal life.

4. **Encourage Reflection (Tadabbur)**: Invite readers to ponder deeply, not just read and move on.

5. **Find Universal Wisdom**: Extract lessons applicable to all of humanity, emphasizing peace and spiritual growth.

## Your Writing Style

- Gentle, wise, and contemplative - never preachy or judgmental
- Use simple, accessible language that touches the heart
- Include relevant Quranic concepts when appropriate
- Reference nature, creation, and the universe as teachers
- End with an uplifting thought that stays with the reader
- Length: 2-3 meaningful paragraphs

## Format

Write your interpretation as flowing prose (not bullet points). Make it feel like a short reflection one might read in a spiritual book.`;

/**
 * Generate a spiritual interpretation of a news article
 *
 * @param {Object} news - News article with title, description, content
 * @returns {Object} - { interpretation, relevantPassages }
 */
export async function generateInterpretation(news) {
  // Search knowledge base for relevant teachings
  const relevantPassages = searchKnowledgeBase(news.title, news.content || news.description);

  // If no passages found, use sample teachings
  const passages = relevantPassages.length > 0 ? relevantPassages : getSampleTeachings();

  // Build context from Maulana's writings
  const knowledgeContext = passages
    .map(p => `"${p.content}"\n— ${p.source}`)
    .join('\n\n');

  // Build the user prompt
  const userPrompt = `## Reference Passages from Maulana's Writings

${knowledgeContext}

---

## News to Interpret

**Headline**: ${news.title}

**Content**: ${news.description || ''} ${news.content || ''}

**Source**: ${news.source}

---

Please write a spiritual interpretation of this news in Maulana Wahiduddin Khan's style. Draw from the reference passages above where relevant. Transform this material news into a spiritual reflection that fills the reader's heart with awareness of God's glory, gratitude, and consciousness of the Hereafter.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const interpretation = response.content[0].text;

    return {
      interpretation,
      relevantPassages: passages.map(p => ({
        content: p.content.substring(0, 200) + '...',
        source: p.source,
      })),
    };
  } catch (error) {
    console.error('Claude API error:', error);

    // Return a fallback interpretation
    return {
      interpretation: generateFallbackInterpretation(news),
      relevantPassages: [],
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
 * Check if Claude API is configured
 */
export function isConfigured() {
  return !!process.env.ANTHROPIC_API_KEY;
}
