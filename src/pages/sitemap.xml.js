import { getArticles } from '../utils/supabase';

export async function get() {
  try {
    let articles = [];
    
    try {
      articles = await getArticles();
    } catch (error) {
      console.error('Error fetching articles for sitemap:', error);
      articles = [];
    }
    
    const baseUrl = import.meta.env.SITE || 'https://playabledata.io';
    
    // Get all unique tags
    const allTags = [...new Set(articles.flatMap(post => post.tags || []))];
    
    // Build sitemap entries
    const pages = [
      { url: '/', lastmod: new Date().toISOString() },
      { url: '/blog/', lastmod: new Date().toISOString() },
      { url: '/topics/', lastmod: new Date().toISOString() },
      ...articles.map(article => ({
        url: `/blog/${article.slug}/`,
        lastmod: article.updated_at || article.created_at
      })),
      ...allTags.map(tag => ({
        url: `/topics/${tag}/`,
        lastmod: new Date().toISOString()
      }))
    ];
    
    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>`;
    
    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return a minimal sitemap with just the main pages
    const baseUrl = import.meta.env.SITE || 'https://playabledata.io';
    const fallbackPages = [
      { url: '/', lastmod: new Date().toISOString() },
      { url: '/blog/', lastmod: new Date().toISOString() },
      { url: '/topics/', lastmod: new Date().toISOString() }
    ];
    
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${fallbackPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>`;
    
    return new Response(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml'
      }
    });
  }
}