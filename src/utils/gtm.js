/**
 * GTM Event Tracking Utility
 * 
 * This file contains functions to track various events using Google Tag Manager
 */

/**
 * Push an event to the dataLayer
 * @param {Object} data - The event data to push
 */
export const pushEvent = (data) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(data);
  }
};

/**
 * Track article view events with enhanced data
 * @param {Object} article - Article data
 */
export const trackArticleView = (article) => {
  pushEvent({
    event: 'articleView',
    articleTitle: article.title,
    articleId: article.slug,
    articleAuthor: article.author?.name || 'Unknown',
    articleTags: article.tags || [],
    articlePublishDate: article.pubDate ? new Date(article.pubDate).toISOString() : ''
  });
};

/**
 * Track form submission events
 * @param {string} formType - Type of form (e.g., 'newsletter', 'contact')
 * @param {boolean} success - Whether submission was successful
 */
export const trackFormSubmission = (formType, success) => {
  pushEvent({
    event: 'formSubmission',
    formType: formType,
    formSuccess: success
  });
};

/**
 * Track outbound link clicks
 * @param {string} url - The URL being clicked
 * @param {string} linkText - The text of the link
 */
export const trackOutboundLink = (url, linkText) => {
  pushEvent({
    event: 'outboundLinkClick',
    outboundUrl: url,
    linkText: linkText
  });
};

/**
 * Track scroll depth for content engagement measurement
 * @param {number} depth - Scroll depth percentage (25, 50, 75, 100)
 */
export const trackScrollDepth = (depth) => {
  pushEvent({
    event: 'scrollDepth',
    scrollDepthValue: depth
  });
};

/**
 * Track search events
 * @param {string} searchTerm - The search term entered by user
 * @param {number} resultsCount - Number of results returned
 */
export const trackSearch = (searchTerm, resultsCount) => {
  pushEvent({
    event: 'search',
    searchTerm: searchTerm,
    searchResultsCount: resultsCount
  });
};

/**
 * Track social sharing events
 * @param {string} platform - Social platform (e.g., 'twitter', 'facebook')
 * @param {string} contentType - Type of content shared (e.g., 'article')
 * @param {string} contentId - ID of the content shared
 */
export const trackSocialShare = (platform, contentType, contentId) => {
  pushEvent({
    event: 'socialShare',
    sharePlatform: platform,
    shareContentType: contentType,
    shareContentId: contentId
  });
}; 