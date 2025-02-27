import { getArticles } from '../utils/supabase';

export async function get() {
  const articles = await getArticles();
  const baseUrl = import.meta.env.SITE || 'https://playable-data-blog.netlify.app';
  
  // Get all unique tags
  const allTags = [...new Set(articles.flatMap(post => post.tags || []))];
  
  // Build sitemap entries
  const pages = [
    { url: '/', lastmod: new Date().toISOString() },
    { url: '/blog', lastmod: new Date().toISOString() },
    { url: '/topics', lastmod: new Date().toISOString() },
    { url: '/case-studies', lastmod: new Date().toISOString() },
    ...articles.map(article => ({
      url: `/blog/${article.slug}`,
      lastmod: article.updated_at || article.created_at
    })),
    ...allTags.map(tag => ({
      url: `/topics/${tag}`,
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
}