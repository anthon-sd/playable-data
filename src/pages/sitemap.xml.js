export async function get({ site }) {
  // Static example data
  const articles = [
    {
      id: '1',
      title: 'Getting Started with Data Analysis',
      slug: 'getting-started-with-data-analysis',
      tags: ['data-analysis', 'beginners'],
      created_at: '2023-01-01T12:00:00Z',
      updated_at: '2023-01-01T12:00:00Z'
    },
    {
      id: '2',
      title: 'Advanced Visualization Techniques',
      slug: 'advanced-visualization-techniques',
      tags: ['data-visualization', 'advanced'],
      created_at: '2023-01-02T12:00:00Z',
      updated_at: '2023-01-02T12:00:00Z'
    },
    {
      id: '3',
      title: 'Understanding Gaming Analytics',
      slug: 'understanding-gaming-analytics',
      tags: ['gaming', 'data-analysis', 'analytics'],
      created_at: '2023-01-03T12:00:00Z',
      updated_at: '2023-01-03T12:00:00Z'
    }
  ];

  // Extract all unique tags from articles
  const allTags = [...new Set(articles.flatMap(post => post.tags || []))];
  
  // Base URL for the site (fallback to example.com if not provided)
  const siteUrl = site?.origin || 'https://example.com';
  
  // Generate URLs for static pages
  const pages = [
    { url: '/', lastModified: new Date() },
    { url: '/blog', lastModified: new Date() },
    { url: '/case-studies', lastModified: new Date() },
    { url: '/contact', lastModified: new Date() },
    { url: '/tags', lastModified: new Date() },
    { url: '/topics', lastModified: new Date() }
  ];
  
  // Add article URLs
  const postUrls = articles.map(post => ({
    url: `/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(post.created_at)
  }));
  
  // Add tag page URLs
  const tagUrls = allTags.map(tag => ({
    url: `/tags/${tag}`,
    lastModified: new Date()
  }));
  
  // Add topic page URLs (same as tags in this implementation)
  const topicUrls = allTags.map(tag => ({
    url: `/topics/${tag}`,
    lastModified: new Date()
  }));
  
  // Combine all URLs
  const urls = [...pages, ...postUrls, ...tagUrls, ...topicUrls];
  
  // Generate the sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(page => `
    <url>
      <loc>${siteUrl}${page.url}</loc>
      <lastmod>${page.lastModified.toISOString()}</lastmod>
    </url>
  `).join('')}
</urlset>`;
  
  return {
    body: sitemap,
    headers: {
      'Content-Type': 'application/xml'
    }
  };
}