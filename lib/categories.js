/**
 * Category Configuration for Spiritual Reflections
 * Defines news categories and Quranic concepts for categorized landing page
 */

export const NEWS_CATEGORIES = {
  inspiration: {
    id: 'inspiration',
    name: 'Inspiration',
    description: 'Real-life stories of people overcoming challenges creatively',
    icon: '💪',
    gradient: 'from-amber-500/10 to-orange-500/10',
    borderColor: 'border-amber-500/30',
    searchQueries: [
      'overcome challenge success story',
      'inspiring recovery story',
      'against all odds triumph',
      'resilience perseverance story',
      'human spirit triumph'
    ],
    keywords: {
      high: ['overcome', 'triumph', 'resilience', 'perseverance', 'courage', 'against all odds', 'remarkable story', 'inspiring', 'never gave up'],
      medium: ['survive', 'recover', 'challenge', 'determination', 'hope', 'success story', 'hero', 'strength'],
      low: ['achievement', 'milestone', 'breakthrough', 'journey', 'struggle']
    },
    quranicConcepts: ['Tawakkul', 'Sabr', 'Shukr'],
    priority: 1
  },
  science: {
    id: 'science',
    name: 'Science',
    description: "Discoveries that inspire awe and God's remembrance",
    icon: '🔬',
    gradient: 'from-blue-500/10 to-purple-500/10',
    borderColor: 'border-blue-500/30',
    searchQueries: [
      'scientific discovery breakthrough',
      'space exploration discovery',
      'nature research findings',
      'universe astronomy discovery',
      'amazing scientific finding'
    ],
    keywords: {
      high: ['discovery', 'breakthrough', 'scientists find', 'researchers discover', 'first time ever', 'evidence found', 'new species'],
      medium: ['research', 'study finds', 'experiment', 'phenomenon', 'universe', 'galaxy', 'nature reveals'],
      low: ['technology', 'innovation', 'advancement', 'development', 'analysis']
    },
    quranicConcepts: ['Tafakkur', 'Ayat', 'Khalq'],
    priority: 2
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    description: "God's signs in creation - wildlife, oceans, and the natural world",
    icon: '🌿',
    gradient: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-500/30',
    searchQueries: [
      'wildlife conservation nature',
      'ocean marine life discovery',
      'forest ecosystem environment',
      'animal behavior nature',
      'natural wonder phenomenon'
    ],
    keywords: {
      high: ['wildlife', 'nature', 'forest', 'ocean', 'marine life', 'conservation', 'ecosystem', 'natural wonder', 'animal behavior'],
      medium: ['environment', 'species', 'habitat', 'biodiversity', 'planet', 'earth', 'climate', 'trees'],
      low: ['garden', 'landscape', 'outdoor', 'seasonal', 'weather']
    },
    quranicConcepts: ['Ayat', 'Khalq', 'Tafakkur'],
    priority: 3
  },
  health: {
    id: 'health',
    name: 'Health',
    description: "Blessings of well-being and the miracle of the human body",
    icon: '💚',
    gradient: 'from-teal-500/10 to-cyan-500/10',
    borderColor: 'border-teal-500/30',
    searchQueries: [
      'health medical breakthrough',
      'wellness mental health positive',
      'medical research treatment',
      'healthy lifestyle longevity',
      'healing recovery medical'
    ],
    keywords: {
      high: ['health breakthrough', 'medical discovery', 'cure', 'healing', 'recovery', 'treatment success', 'wellness'],
      medium: ['healthy', 'medicine', 'therapy', 'mental health', 'well-being', 'longevity', 'fitness'],
      low: ['nutrition', 'diet', 'exercise', 'lifestyle', 'prevention']
    },
    quranicConcepts: ['Shukr', 'Shifa', 'Rizq'],
    priority: 4
  }
};

export const QURANIC_CONCEPTS = {
  Tawakkul: {
    name: 'Tawakkul',
    arabicName: 'توكل',
    meaning: 'Trust in God',
    description: 'Complete reliance on Allah while taking appropriate action',
    keywords: ['trust', 'rely', 'faith', 'depend', 'confidence', 'overcome', 'hope']
  },
  Sabr: {
    name: 'Sabr',
    arabicName: 'صبر',
    meaning: 'Patience & Perseverance',
    description: 'Steadfastness in face of trials',
    keywords: ['patience', 'endure', 'persevere', 'steadfast', 'wait', 'trial', 'difficulty']
  },
  Shukr: {
    name: 'Shukr',
    arabicName: 'شكر',
    meaning: 'Gratitude',
    description: 'Thankfulness to Allah for all blessings',
    keywords: ['grateful', 'thankful', 'blessing', 'gift', 'appreciate', 'favor']
  },
  Tafakkur: {
    name: 'Tafakkur',
    arabicName: 'تفكر',
    meaning: 'Contemplation',
    description: "Deep reflection on Allah's creation",
    keywords: ['think', 'reflect', 'ponder', 'contemplate', 'understand', 'discover', 'universe', 'creation']
  },
  Ayat: {
    name: 'Ayat',
    arabicName: 'آيات',
    meaning: 'Signs of God',
    description: "Recognizing Allah's signs in creation",
    keywords: ['sign', 'evidence', 'proof', 'wonder', 'miracle', 'creation', 'nature']
  },
  Khalq: {
    name: 'Khalq',
    arabicName: 'خلق',
    meaning: 'Creation',
    description: "Allah's creative power manifested in the universe",
    keywords: ['create', 'universe', 'nature', 'life', 'origin', 'beginning', 'design']
  },
  Hidayah: {
    name: 'Hidayah',
    arabicName: 'هداية',
    meaning: 'Guidance',
    description: "Divine guidance toward the right path",
    keywords: ['guide', 'path', 'direction', 'lead', 'show', 'way']
  },
  Rizq: {
    name: 'Rizq',
    arabicName: 'رزق',
    meaning: 'Provision',
    description: "Allah's provision and sustenance",
    keywords: ['provision', 'sustain', 'provide', 'gift', 'blessing', 'resource']
  },
  Shifa: {
    name: 'Shifa',
    arabicName: 'شفاء',
    meaning: 'Healing',
    description: "Divine healing and cure from Allah",
    keywords: ['heal', 'cure', 'recovery', 'health', 'medicine', 'treatment', 'wellness']
  }
};

/**
 * Get category configuration by ID
 */
export function getCategoryConfig(categoryId) {
  return NEWS_CATEGORIES[categoryId] || null;
}

/**
 * Get all category IDs
 */
export function getCategoryIds() {
  return Object.keys(NEWS_CATEGORIES);
}

/**
 * Get Quranic concept by name
 */
export function getQuranicConcept(name) {
  return QURANIC_CONCEPTS[name] || null;
}

/**
 * Get all Quranic concepts as array
 */
export function getAllQuranicConcepts() {
  return Object.values(QURANIC_CONCEPTS);
}
