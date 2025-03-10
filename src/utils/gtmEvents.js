/**
 * Google Tag Manager Events Script
 * 
 * This script handles all client-side GTM event tracking.
 * It is designed to be loaded after the GTM initialization.
 */

// Initialize dataLayer if it doesn't exist
window.dataLayer = window.dataLayer || [];

/**
 * GTM Events Configuration
 */
const GTMEvents = {
  // Core tracking methods
  trackEvent: function(eventName, eventParams = {}) {
    if (!eventName) return;
    
    const eventData = {
      event: eventName,
      ...eventParams,
      eventTimestamp: new Date().toISOString()
    };
    
    window.dataLayer.push(eventData);
    console.debug('[GTM Event]', eventData);
  },
  
  // User Engagement Tracking
  trackEngagement: {
    // Track scroll depth
    scrollDepth: function() {
      if (this.scrollTracking) return; // Already initialized
      
      const scrollDepths = [25, 50, 75, 100];
      let trackedDepths = [];
      
      const calculateScrollDepth = () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        
        const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
        
        scrollDepths.forEach(depth => {
          if (scrollPercentage >= depth && !trackedDepths.includes(depth)) {
            trackedDepths.push(depth);
            GTMEvents.trackEvent('scrollDepth', { scrollDepthValue: depth });
          }
        });
      };
      
      window.addEventListener('scroll', calculateScrollDepth);
      this.scrollTracking = true;
    },
    
    // Track time spent on page
    timeOnPage: function() {
      if (this.timeTracking) return; // Already initialized
      
      const timeIntervals = [10, 30, 60, 120, 300]; // in seconds
      let trackedIntervals = [];
      let startTime = new Date();
      
      const trackTimeInterval = () => {
        const secondsOnPage = Math.floor((new Date() - startTime) / 1000);
        
        timeIntervals.forEach(interval => {
          if (secondsOnPage >= interval && !trackedIntervals.includes(interval)) {
            trackedIntervals.push(interval);
            GTMEvents.trackEvent('timeOnPage', { timeOnPageValue: interval });
          }
        });
      };
      
      const intervalId = setInterval(trackTimeInterval, 5000);
      this.timeTracking = intervalId;
    }
  },
  
  // Content Interaction Tracking
  trackInteractions: {
    // Track clicks on elements matching selector
    clickTracking: function(selector, eventName, additionalData = {}) {
      const elements = document.querySelectorAll(selector);
      
      elements.forEach(element => {
        element.addEventListener('click', function(e) {
          GTMEvents.trackEvent(eventName, {
            elementId: this.id || '',
            elementText: this.textContent?.trim() || '',
            elementClasses: this.className || '',
            ...additionalData
          });
        });
      });
    },
    
    // Track form submissions
    formSubmissions: function(formSelector = 'form') {
      const forms = document.querySelectorAll(formSelector);
      
      forms.forEach(form => {
        form.addEventListener('submit', function(e) {
          const formId = this.id || 'unnamed-form';
          const formType = this.dataset.formType || 'general';
          
          // Collect non-sensitive form field names (avoid passwords, etc.)
          const fields = Array.from(this.elements)
            .filter(el => !['password', 'credit-card'].includes(el.type))
            .map(el => el.name || el.id);
          
          GTMEvents.trackEvent('formSubmission', {
            formId,
            formType,
            formFields: fields.join(','),
            formLocation: window.location.pathname
          });
        });
      });
    },
    
    // Track outbound links
    outboundLinks: function() {
      const links = document.querySelectorAll('a[href^="http"]');
      
      links.forEach(link => {
        // Ignore links to the current domain
        if (link.hostname === window.location.hostname) return;
        
        link.addEventListener('click', function(e) {
          const url = this.getAttribute('href');
          const linkText = this.textContent?.trim() || '';
          
          GTMEvents.trackEvent('outboundLinkClick', {
            outboundUrl: url,
            linkText: linkText,
            linkContext: this.closest('section')?.id || ''
          });
        });
      });
    },
    
    // Track file downloads
    fileDownloads: function() {
      const fileExtensions = ['.pdf', '.zip', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
      const downloadLinks = document.querySelectorAll('a');
      
      downloadLinks.forEach(link => {
        const href = link.href.toLowerCase();
        const isDownload = fileExtensions.some(ext => href.endsWith(ext));
        
        if (isDownload) {
          link.addEventListener('click', function(e) {
            GTMEvents.trackEvent('fileDownload', {
              fileName: href.split('/').pop(),
              fileType: href.split('.').pop(),
              fileUrl: href
            });
          });
        }
      });
    }
  },
  
  // E-commerce Tracking
  ecommerce: {
    // Track product views
    viewProduct: function(product) {
      GTMEvents.trackEvent('productView', {
        ecommerce: {
          items: [{
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            item_category: product.category,
            item_variant: product.variant || ''
          }]
        }
      });
    },
    
    // Track add to cart
    addToCart: function(product, quantity) {
      GTMEvents.trackEvent('addToCart', {
        ecommerce: {
          items: [{
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            quantity: quantity || 1
          }]
        }
      });
    }
  },
  
  // Initialize all tracking
  init: function(options = {}) {
    // Core engagement tracking
    this.trackEngagement.scrollDepth();
    this.trackEngagement.timeOnPage();
    
    // Interactive elements tracking
    this.trackInteractions.outboundLinks();
    this.trackInteractions.fileDownloads();
    this.trackInteractions.formSubmissions();
    
    // Track custom elements if specified
    if (options.trackButtons) {
      this.trackInteractions.clickTracking('button, .btn', 'buttonClick');
    }
    
    console.log('[GTM Events] Initialized');
  }
};

// Auto-initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  GTMEvents.init();
});

// Export for use in other scripts
export default GTMEvents; 