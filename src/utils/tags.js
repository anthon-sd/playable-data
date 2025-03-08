// Default tags to use as fallback
export const DEFAULT_TAGS = [
  'analytics',
  'game-development',
  'data',
  'retention',
  'game-design',
  'monetization',
  'indie',
  'business',
  'player-behavior',
  'metrics'
];

/**
 * Get all unique tags from articles
 * @param {Array} articles List of articles
 * @returns {Array} Unique tags sorted alphabetically
 */
export function getUniqueTags(articles = []) {
  const tags = articles.reduce((acc, article) => {
    if (article.tags && Array.isArray(article.tags)) {
      article.tags.forEach(tag => acc.add(tag));
    }
    return acc;
  }, new Set());
  
  return tags.size > 0 ? [...tags].sort() : DEFAULT_TAGS;
}

/**
 * Get articles filtered by tag
 * @param {Array} articles List of articles
 * @param {string} tag Tag to filter by
 * @returns {Array} Filtered articles
 */
export function getArticlesByTag(articles = [], tag) {
  return articles.filter(article => 
    article.tags && Array.isArray(article.tags) && article.tags.includes(tag)
  );
}

/**
 * Get tag counts from articles
 * @param {Array} articles List of articles
 * @returns {Object} Tag counts object
 */
export function getTagCounts(articles = []) {
  const counts = articles.reduce((acc, article) => {
    if (article.tags && Array.isArray(article.tags)) {
      article.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
    }
    return acc;
  }, {});
  
  return Object.keys(counts).length > 0 ? counts : DEFAULT_TAGS.reduce((acc, tag) => {
    acc[tag] = 0;
    return acc;
  }, {});
}