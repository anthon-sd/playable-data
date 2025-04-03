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
 * @param {Object} additionalData - Additional form data to track
 */
export const trackFormSubmission = (formType, success, additionalData = {}) => {
  const dataLayer = window.dataLayer = window.dataLayer || [];
  
  // Base form submission event
  const eventData = {
    event: 'formSubmission',
    formType: formType,
    formSuccess: success,
    formLocation: window.location.pathname,
    ...additionalData
  };
  
  // Remove sensitive data before tracking
  delete eventData.userEmail;
  delete eventData.password;
  delete eventData.creditCard;
  
  dataLayer.push(eventData);
};

/**
 * Track outbound link clicks
 * @param {string} url - The URL being clicked
 * @param {string} linkText - The text of the link
 * @param {string} linkContext - Optional context of where the link was clicked
 */
export const trackOutboundLink = (url, linkText, linkContext = '') => {
  // Ignore links to the current domain
  if (url && new URL(url).hostname === window.location.hostname) return;
  
  pushEvent({
    event: 'outboundLinkClick',
    outboundUrl: url,
    linkText: linkText?.trim() || '',
    linkContext: linkContext
  });
};

/**
 * Track scroll depth for content engagement measurement
 * @param {number} depth - Scroll depth percentage (25, 50, 75, 100)
 * @param {string} context - Optional context (e.g., 'article', 'page')
 * @param {string} contentId - Optional content ID (e.g., article slug)
 */
export const trackScrollDepth = (depth, context = 'page', contentId = '') => {
  pushEvent({
    event: 'scrollDepth',
    scrollDepthValue: depth,
    scrollContext: context,
    contentId: contentId
  });
};

/**
 * Track time spent on page
 * @param {number} seconds - Time spent in seconds
 * @param {string} context - Optional context (e.g., 'article', 'page')
 * @param {string} contentId - Optional content ID (e.g., article slug)
 */
export const trackTimeOnPage = (seconds, context = 'page', contentId = '') => {
  pushEvent({
    event: 'timeOnPage',
    timeOnPageValue: seconds,
    timeContext: context,
    contentId: contentId
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

/**
 * Initialize all tracking
 * @param {Object} options - Tracking options
 */
export const initTracking = (options = {}) => {
  if (typeof window === 'undefined') return;
  
  const dataLayer = window.dataLayer = window.dataLayer || [];
  
  // Track scroll depth
  const scrollDepths = [25, 50, 75, 100];
  let trackedDepths = [];
  
  function calculateScrollDepth() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    
    const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
    
    scrollDepths.forEach(depth => {
      if (scrollPercentage >= depth && !trackedDepths.includes(depth)) {
        trackedDepths.push(depth);
        trackScrollDepth(depth, options.context, options.contentId);
      }
    });
  }
  
  // Track time on page
  const timeIntervals = [10, 30, 60, 120, 300]; // in seconds
  let trackedIntervals = [];
  let startTime = new Date();
  
  function trackTimeInterval() {
    const secondsOnPage = Math.floor((new Date() - startTime) / 1000);
    
    timeIntervals.forEach(interval => {
      if (secondsOnPage >= interval && !trackedIntervals.includes(interval)) {
        trackedIntervals.push(interval);
        trackTimeOnPage(interval, options.context, options.contentId);
      }
    });
  }
  
  // Set up event listeners
  document.addEventListener('DOMContentLoaded', () => {
    // Scroll tracking
    window.addEventListener('scroll', calculateScrollDepth);
    
    // Time tracking
    setInterval(trackTimeInterval, 5000);
    
    // Outbound link tracking
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const url = link.getAttribute('href');
        const linkText = link.textContent?.trim() || '';
        const linkContext = link.closest('section')?.id || '';
        
        trackOutboundLink(url, linkText, linkContext);
      });
    });
  });
}; 