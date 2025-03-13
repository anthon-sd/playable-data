/**
 * Sitemap Test Script
 * 
 * This script is used to test the sitemap generation logic locally,
 * helping to ensure that blog posts are properly included in the sitemap.
 * 
 * Run with: node debug/test-sitemap.js
 */

// Import the getArticles function - adjust path if needed
const { getArticles } = require('../src/utils/supabase');

// Mock formatDate function from sitemap.xml.js
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
};

async function testSitemap() {
  console.log('=== Sitemap Generation Test ===');
  
  try {
    console.log('Fetching articles for sitemap...');
    const articles = await getArticles();
    console.log(`Successfully fetched ${articles.length} articles for sitemap`);
    
    // Get all unique tags and topics
    const allTags = [...new Set(articles.flatMap(post => post.tags || []))];
    const allTopics = [...new Set(articles.flatMap(post => post.topics || []))];
    
    console.log(`Sitemap will include: ${articles.length} articles, ${allTopics.length} topics, ${allTags.length} tags`);
    
    // Output details for each article
    console.log('\n=== Article Details ===');
    articles.forEach((article, index) => {
      console.log(`\nArticle #${index + 1}:`);
      console.log(`Title: ${article.title}`);
      console.log(`Slug: ${article.slug}`);
      console.log(`URL: /blog/${article.slug.toLowerCase()}/`);
      console.log(`Date: ${formatDate(article.updated_at || article.created_at)}`);
      console.log(`Featured: ${article.featured ? 'Yes' : 'No'}`);
      console.log(`Topics: ${article.topics?.join(', ') || 'None'}`);
      console.log(`Tags: ${article.tags?.join(', ') || 'None'}`);
    });
    
    // Create a mock sitemap structure
    const baseUrl = 'https://playabledata.io';
    
    const pages = [
      // Main pages
      { url: '/', priority: '1.0', changefreq: 'daily', lastmod: new Date().toISOString() },
      { url: '/blog/', priority: '0.9', changefreq: 'daily', lastmod: new Date().toISOString() },
      { url: '/topics/', priority: '0.8', changefreq: 'weekly', lastmod: new Date().toISOString() },
      
      // Articles
      ...articles.map(article => ({
        url: `/blog/${article.slug.toLowerCase()}/`,
        priority: article.featured === true || article.featured === 'true' ? '0.8' : '0.7',
        changefreq: 'monthly',
        lastmod: formatDate(article.updated_at || article.created_at)
      })),
      
      // Topic pages
      ...allTopics.map(topic => ({
        url: `/topics/${topic.toLowerCase()}/`,
        priority: '0.6',
        changefreq: 'weekly',
        lastmod: new Date().toISOString()
      })),
      
      // Tag pages
      ...allTags.map(tag => ({
        url: `/topics/${tag.toLowerCase()}/`,
        priority: '0.5',
        changefreq: 'weekly',
        lastmod: new Date().toISOString()
      }))
    ];
    
    // Filter out duplicates in case topics and tags overlap
    const uniqueUrls = new Set();
    const uniquePages = pages.filter(page => {
      if (uniqueUrls.has(page.url)) {
        return false;
      }
      uniqueUrls.add(page.url);
      return true;
    });
    
    console.log(`\nSitemap contains ${uniquePages.length} unique URLs`);
    
    // Generate sample sitemap XML (first few entries)
    console.log('\n=== Sample Sitemap XML ===');
    
    // Show the first 3 standard pages plus the first 5 articles (or all if fewer)
    const samplePages = [...uniquePages.slice(0, 3), ...uniquePages.filter(p => p.url.includes('/blog/')).slice(0, 5)];
    
    const sampleSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${samplePages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    console.log(sampleSitemap);
    
    console.log('\n=== Sitemap Test Completed ===');
    console.log(`Total pages: ${uniquePages.length}`);
    console.log(`Articles: ${articles.length}`);
    console.log(`Topics: ${allTopics.length}`);
    console.log(`Tags: ${allTags.length}`);
    
  } catch (error) {
    console.error('Error in sitemap test:', error);
  }
}

// Run the test
testSitemap(); 