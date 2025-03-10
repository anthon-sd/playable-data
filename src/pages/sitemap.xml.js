import { getArticles } from '../utils/supabase';

export async function GET() {
  try {
    let articles = [];
    
    try {
      articles = await getArticles();
    } catch (error) {
      console.error('Error fetching articles for sitemap:', error);
      articles = [];
    }
    
    const baseUrl = import.meta.env.SITE || 'https://playabledata.io';
    
    // Get all unique tags and topics
    const allTags = [...new Set(articles.flatMap(post => post.tags || []))];
    const allTopics = [...new Set(articles.flatMap(post => post.topics || []))];
    
    // Prioritize and set change frequency for different content types
    const pages = [
      // Main pages with high priority and frequent changes
      { url: '/', priority: '1.0', changefreq: 'daily', lastmod: new Date().toISOString() },
      { url: '/blog/', priority: '0.9', changefreq: 'daily', lastmod: new Date().toISOString() },
      { url: '/topics/', priority: '0.8', changefreq: 'weekly', lastmod: new Date().toISOString() },
      
      // Articles with medium-high priority
      ...articles.map(article => ({
        url: `/blog/${article.slug.toLowerCase()}/`,
        priority: article.featured === true || article.featured === 'true' ? '0.8' : '0.7',
        changefreq: 'monthly',
        lastmod: article.updated_at || article.created_at
      })),
      
      // Topic pages
      ...allTopics.map(topic => ({
        url: `/topics/${topic.toLowerCase()}/`,
        priority: '0.6',
        changefreq: 'weekly',
        lastmod: new Date().toISOString()
      })),
      
      // Tag pages with lower priority
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
    
    // Generate sitemap XML with priority and change frequency
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniquePages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return a minimal sitemap with just the main pages
    const baseUrl = import.meta.env.SITE || 'https://playabledata.io';
    const fallbackPages = [
      { url: '/', priority: '1.0', changefreq: 'daily', lastmod: new Date().toISOString() },
      { url: '/blog/', priority: '0.9', changefreq: 'daily', lastmod: new Date().toISOString() },
      { url: '/topics/', priority: '0.8', changefreq: 'weekly', lastmod: new Date().toISOString() }
    ];
    
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${fallbackPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    return new Response(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }
}