/**
 * Quran Verses for Spiritual Reflections
 * Categorized by theme for dynamic selection based on news topics
 */

const QURAN_VERSES = {
  // Science & Discovery
  science: [
    { text: "We will show them Our signs in the horizons and within themselves until it becomes clear to them that it is the truth.", ref: "41:53" },
    { text: "Do they not look at the camels, how they are created? And at the sky, how it is raised? And at the mountains, how they are erected? And at the earth, how it is spread out?", ref: "88:17-20" },
    { text: "Indeed, in the creation of the heavens and the earth and the alternation of the night and the day are signs for those of understanding.", ref: "3:190" },
  ],

  // Nature & Environment
  nature: [
    { text: "And it is He who sends down rain from the sky, and We produce thereby the growth of all things.", ref: "6:99" },
    { text: "And the earth - We have spread it and cast therein firmly set mountains and caused to grow therein something of every beautiful kind.", ref: "50:7" },
    { text: "Do you not see that Allah sends down rain from the sky and makes it flow as springs in the earth?", ref: "39:21" },
  ],

  // Health & Medicine
  health: [
    { text: "And when I am ill, it is He who cures me.", ref: "26:80" },
    { text: "O mankind, there has come to you instruction from your Lord and healing for what is in the breasts.", ref: "10:57" },
    { text: "We send down the Quran as a healing and mercy for the believers.", ref: "17:82" },
  ],

  // Space & Universe
  space: [
    { text: "And We have certainly beautified the nearest heaven with stars.", ref: "67:5" },
    { text: "It is He who created the night and the day and the sun and the moon; all in an orbit are swimming.", ref: "21:33" },
    { text: "And He has subjected to you the night and day and the sun and moon, and the stars are subjected by His command.", ref: "16:12" },
  ],

  // Technology & Innovation
  technology: [
    { text: "And He taught Adam the names - all of them.", ref: "2:31" },
    { text: "Read in the name of your Lord who created. Created man from a clinging substance. Read, and your Lord is the most Generous. Who taught by the pen. Taught man that which he knew not.", ref: "96:1-5" },
    { text: "And We have certainly honored the children of Adam.", ref: "17:70" },
  ],

  // Economy & Business
  economy: [
    { text: "And do not consume one another's wealth unjustly or send it to the rulers in order that you might consume a portion of the wealth of the people in sin.", ref: "2:188" },
    { text: "O you who have believed, fulfill all contracts.", ref: "5:1" },
    { text: "And Allah has permitted trade and has forbidden interest.", ref: "2:275" },
  ],

  // Social & Community
  social: [
    { text: "O mankind, indeed We have created you from male and female and made you peoples and tribes that you may know one another.", ref: "49:13" },
    { text: "And cooperate in righteousness and piety, but do not cooperate in sin and aggression.", ref: "5:2" },
    { text: "The believers are but brothers, so make settlement between your brothers.", ref: "49:10" },
  ],

  // Gratitude & Blessings
  gratitude: [
    { text: "And He gave you from all you asked of Him. And if you should count the favor of Allah, you could not enumerate them.", ref: "14:34" },
    { text: "If you are grateful, I will surely increase you in favor.", ref: "14:7" },
    { text: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.", ref: "2:152" },
  ],

  // Reflection & Contemplation (default)
  contemplation: [
    { text: "And He has subjected to you whatever is in the heavens and whatever is on the earth - all from Him. Indeed in that are signs for a people who give thought.", ref: "45:13" },
    { text: "Then do they not reflect upon the Quran, or are there locks upon their hearts?", ref: "47:24" },
    { text: "Indeed, in the creation of the heavens and earth, and the alternation of the night and the day, and the ships which sail through the sea with that which benefits people... are signs for a people who use reason.", ref: "2:164" },
  ],

  // Hope & Perseverance
  hope: [
    { text: "So verily, with the hardship, there is relief. Verily, with the hardship, there is relief.", ref: "94:5-6" },
    { text: "And whoever fears Allah - He will make for him a way out. And will provide for him from where he does not expect.", ref: "65:2-3" },
    { text: "Do not lose hope in the mercy of Allah.", ref: "39:53" },
  ],

  // Life & Death
  life: [
    { text: "Every soul will taste death. Then to Us will you be returned.", ref: "29:57" },
    { text: "And We have certainly created man and We know what his soul whispers to him, and We are closer to him than his jugular vein.", ref: "50:16" },
    { text: "He who created death and life to test you as to which of you is best in deed.", ref: "67:2" },
  ],
};

// Keywords that map to verse categories
const KEYWORD_MAP = {
  science: ['research', 'study', 'scientist', 'discovery', 'experiment', 'laboratory', 'findings', 'evidence'],
  nature: ['climate', 'environment', 'weather', 'forest', 'ocean', 'wildlife', 'animal', 'plant', 'tree', 'water', 'rain', 'flood', 'drought'],
  health: ['health', 'medical', 'doctor', 'hospital', 'disease', 'cure', 'treatment', 'vaccine', 'medicine', 'patient', 'wellness'],
  space: ['space', 'nasa', 'satellite', 'planet', 'star', 'moon', 'sun', 'galaxy', 'universe', 'astronaut', 'rocket', 'mars', 'asteroid'],
  technology: ['technology', 'ai', 'artificial intelligence', 'robot', 'computer', 'digital', 'internet', 'software', 'innovation', 'tech'],
  economy: ['economy', 'market', 'stock', 'trade', 'business', 'finance', 'money', 'bank', 'investment', 'gdp', 'inflation'],
  social: ['community', 'society', 'people', 'family', 'children', 'education', 'school', 'culture', 'peace', 'unity', 'cooperation'],
  gratitude: ['gift', 'blessing', 'success', 'achievement', 'milestone', 'celebrate', 'award', 'honor', 'grateful'],
  hope: ['hope', 'recovery', 'survive', 'overcome', 'resilience', 'strength', 'courage', 'miracle', 'rescue'],
  life: ['life', 'death', 'birth', 'age', 'elderly', 'generation', 'mortality', 'soul', 'spirit'],
};

/**
 * Get a relevant Quran verse based on news content
 */
export function getRelevantVerse(title, content = '') {
  const text = `${title} ${content}`.toLowerCase();

  // Find matching category based on keywords
  let matchedCategory = 'contemplation'; // default
  let maxMatches = 0;

  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      matchedCategory = category;
    }
  }

  // Get verses for the matched category
  const verses = QURAN_VERSES[matchedCategory] || QURAN_VERSES.contemplation;

  // Select a verse (use hash of title for consistency)
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const verseIndex = hash % verses.length;

  return verses[verseIndex];
}

/**
 * Get all verse categories
 */
export function getCategories() {
  return Object.keys(QURAN_VERSES);
}
