/**
 * Favorites Management
 * Uses localStorage to store user's favorite interpretations
 *
 * Note: This module runs on the client side only
 */

const STORAGE_KEY = 'spiritual-reflections-favorites';

/**
 * Get all favorites from localStorage
 * @returns {Array} Array of favorite items
 */
export function getFavorites() {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
}

/**
 * Check if an item is in favorites
 * @param {string} id - The news article ID
 * @returns {boolean}
 */
export function isFavorite(id) {
  const favorites = getFavorites();
  return favorites.some(fav => fav.id === id);
}

/**
 * Add an item to favorites
 * @param {Object} item - The news article with interpretation
 */
export function addFavorite(item) {
  if (typeof window === 'undefined') return;

  try {
    const favorites = getFavorites();

    // Check if already exists
    if (favorites.some(fav => fav.id === item.id)) {
      return;
    }

    // Add with timestamp
    favorites.unshift({
      ...item,
      savedAt: new Date().toISOString(),
    });

    // Keep only last 50 favorites
    const trimmed = favorites.slice(0, 50);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving favorite:', error);
  }
}

/**
 * Remove an item from favorites
 * @param {string} id - The news article ID
 */
export function removeFavorite(id) {
  if (typeof window === 'undefined') return;

  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(fav => fav.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
}

/**
 * Toggle favorite status
 * @param {Object} item - The news article with interpretation
 * @returns {boolean} New favorite status
 */
export function toggleFavorite(item) {
  if (isFavorite(item.id)) {
    removeFavorite(item.id);
    return false;
  } else {
    addFavorite(item);
    return true;
  }
}

/**
 * Clear all favorites
 */
export function clearFavorites() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
