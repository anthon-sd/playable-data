// Default topics to use as fallback
export const DEFAULT_TOPICS = [
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
 * Get all unique topics from articles
 * @param {Array} articles List of articles
 * @returns {Array} Unique topics sorted alphabetically
 */
export function getUniqueTopics(articles = []) {
  const topics = articles.reduce((acc, article) => {
    if (article.topics && Array.isArray(article.topics)) {
      article.topics.forEach(topic => acc.add(topic));
    }
    return acc;
  }, new Set());
  
  return topics.size > 0 ? [...topics].sort() : DEFAULT_TOPICS;
}

/**
 * Get articles filtered by topic
 * @param {Array} articles List of articles
 * @param {string} topic Topic to filter by
 * @returns {Array} Filtered articles
 */
export function getArticlesByTopic(articles = [], topic) {
  return articles.filter(article => 
    article.topics && Array.isArray(article.topics) && article.topics.includes(topic)
  );
}

/**
 * Get topic counts from articles
 * @param {Array} articles List of articles
 * @returns {Object} Topic counts object
 */
export function getTopicCounts(articles = []) {
  const counts = articles.reduce((acc, article) => {
    if (article.topics && Array.isArray(article.topics)) {
      article.topics.forEach(topic => {
        acc[topic] = (acc[topic] || 0) + 1;
      });
    }
    return acc;
  }, {});
  
  return Object.keys(counts).length > 0 ? counts : DEFAULT_TOPICS.reduce((acc, topic) => {
    acc[topic] = 0;
    return acc;
  }, {});
}