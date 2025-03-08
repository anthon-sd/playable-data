/**
 * Content Bridge - Connects Supabase articles with Astro content collections
 * This utility provides functions to sync between the database and content files
 */

import { getCollection } from 'astro:content';
import { getArticles, createArticle, updateArticle } from './supabase';
import fs from 'node:fs';
import path from 'node:path';
import slugify from 'slugify';

// Path to content directory
const CONTENT_DIR = path.join(process.cwd(), 'src', 'content');
const BLOG_DIR = path.join(CONTENT_DIR, 'blog');

/**
 * Get all blog posts from the content collection
 */
export async function getContentPosts() {
  try {
    return await getCollection('blog');
  } catch (error) {
    console.error('Error fetching content posts:', error);
    return [];
  }
}

/**
 * Sync database articles with content collection
 * This creates a mapping between database articles and content files
 */
export async function getContentMapping() {
  try {
    // Get articles from database
    const dbArticles = await getArticles();
    
    // Get content posts
    const contentPosts = await getContentPosts();
    
    // Create mapping
    const mapping = {};
    
    // Map content posts to database articles by slug
    contentPosts.forEach(post => {
      const matchingDbArticle = dbArticles.find(article => article.slug === post.slug);
      
      if (matchingDbArticle) {
        mapping[post.slug] = {
          contentId: post.id,
          dbId: matchingDbArticle.id,
          title: post.data.title,
          slug: post.slug,
          source: 'both'
        };
      } else {
        mapping[post.slug] = {
          contentId: post.id,
          dbId: null,
          title: post.data.title,
          slug: post.slug,
          source: 'content'
        };
      }
    });
    
    // Add database articles that don't have content files
    dbArticles.forEach(article => {
      if (!mapping[article.slug]) {
        mapping[article.slug] = {
          contentId: null,
          dbId: article.id,
          title: article.title,
          slug: article.slug,
          source: 'database'
        };
      }
    });
    
    return mapping;
  } catch (error) {
    console.error('Error creating content mapping:', error);
    return {};
  }
}

/**
 * Import a single content file into the database
 */
export async function importContentFileToDatabase(slug) {
  try {
    const contentPosts = await getContentPosts();
    const post = contentPosts.find(p => p.slug === slug);
    
    if (!post) {
      throw new Error(`Content file with slug "${slug}" not found`);
    }
    
    // Create article object from content file
    const article = {
      title: post.data.title,
      slug: post.slug,
      content: post.body,
      description: post.data.description || '',
      cover_image: post.data.coverImage || '',
      tags: post.data.tags || [],
      status: 'published',
      author_name: post.data.author?.name || 'Admin',
      created_at: post.data.pubDate?.toISOString() || new Date().toISOString(),
      updated_at: post.data.updatedDate?.toISOString() || new Date().toISOString()
    };
    
    // Save to database
    const newArticle = await createArticle(article);
    return newArticle;
  } catch (error) {
    console.error(`Error importing content file "${slug}":`, error);
    throw error;
  }
}

/**
 * Import all content files into the database
 */
export async function importContentToDatabase() {
  try {
    const contentPosts = await getContentPosts();
    const mapping = await getContentMapping();
    const results = [];
    
    for (const post of contentPosts) {
      // Skip if already in database
      if (mapping[post.slug]?.source === 'both') {
        results.push({
          slug: post.slug,
          status: 'skipped',
          message: 'Already exists in database'
        });
        continue;
      }
      
      try {
        // Import to database
        await importContentFileToDatabase(post.slug);
        results.push({
          slug: post.slug,
          status: 'success',
          message: 'Imported successfully'
        });
      } catch (error) {
        results.push({
          slug: post.slug,
          status: 'error',
          message: error.message
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error importing content to database:', error);
    throw error;
  }
}

/**
 * Export a database article to a content file
 */
export async function exportDatabaseArticleToContent(slug) {
  try {
    const dbArticles = await getArticles();
    const article = dbArticles.find(a => a.slug === slug);
    
    if (!article) {
      throw new Error(`Database article with slug "${slug}" not found`);
    }
    
    // Create frontmatter
    const frontmatter = {
      title: article.title,
      description: article.description || '',
      pubDate: new Date(article.created_at).toISOString().split('T')[0],
      ...(article.updated_at && article.updated_at !== article.created_at 
          ? { updatedDate: new Date(article.updated_at).toISOString().split('T')[0] } 
          : {}),
      ...(article.cover_image ? { coverImage: article.cover_image } : {}),
      ...(article.author_name ? { 
        author: { 
          name: article.author_name,
          ...(article.author_image ? { image: article.author_image } : {})
        } 
      } : {}),
      ...(article.tags && article.tags.length > 0 ? { tags: article.tags } : {}),
      ...(article.featured ? { featured: article.featured } : {})
    };
    
    // Format frontmatter as YAML
    const frontmatterStr = `---\n${Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${JSON.stringify(value)}`;
        } else if (typeof value === 'object' && value !== null) {
          return `${key}:\n  ${Object.entries(value)
            .map(([k, v]) => `${k}: "${v}"`)
            .join('\n  ')}`;
        } else if (typeof value === 'string') {
          return `${key}: "${value}"`;
        } else {
          return `${key}: ${value}`;
        }
      })
      .join('\n')}
---\n\n`;
    
    // Combine frontmatter and content
    const fileContent = frontmatterStr + (article.content || '');
    
    // Determine file extension (.md or .mdx)
    const fileExt = article.content?.includes('import') || article.content?.includes('export') ? 'mdx' : 'md';
    
    // Create file path
    const filePath = path.join(BLOG_DIR, `${article.slug}.${fileExt}`);
    
    // Ensure blog directory exists
    if (!fs.existsSync(BLOG_DIR)) {
      fs.mkdirSync(BLOG_DIR, { recursive: true });
    }
    
    // Write file
    fs.writeFileSync(filePath, fileContent, 'utf8');
    
    return {
      slug: article.slug,
      path: filePath,
      status: 'success'
    };
  } catch (error) {
    console.error(`Error exporting database article "${slug}":`, error);
    throw error;
  }
}

/**
 * Export all database articles to content files
 */
export async function exportDatabaseToContent() {
  try {
    const dbArticles = await getArticles();
    const mapping = await getContentMapping();
    const results = [];
    
    for (const article of dbArticles) {
      try {
        // Export to content file
        const result = await exportDatabaseArticleToContent(article.slug);
        results.push({
          slug: article.slug,
          status: 'success',
          message: 'Exported successfully',
          path: result.path
        });
      } catch (error) {
        results.push({
          slug: article.slug,
          status: 'error',
          message: error.message
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error exporting database to content:', error);
    throw error;
  }
}

/**
 * Get a list of all articles from both sources
 */
export async function getAllArticles() {
  try {
    const mapping = await getContentMapping();
    return Object.values(mapping);
  } catch (error) {
    console.error('Error getting all articles:', error);
    return [];
  }
}

/**
 * Create database entries for existing content files
 * This is useful for initial setup
 */
export async function syncContentToDatabase() {
  try {
    const contentPosts = await getContentPosts();
    const dbArticles = await getArticles();
    
    // Create a map of existing slugs for quick lookup
    const existingSlugs = new Set(dbArticles.map(article => article.slug));
    
    // Process each content post
    for (const post of contentPosts) {
      // Skip if already in database
      if (existingSlugs.has(post.slug)) {
        continue;
      }
      
      // Create article object from content file
      const article = {
        title: post.data.title,
        slug: post.slug,
        content: post.body,
        description: post.data.description || '',
        cover_image: post.data.coverImage || '',
        tags: post.data.tags || [],
        status: 'published',
        author_name: post.data.author?.name || 'Admin',
        created_at: post.data.pubDate?.toISOString() || new Date().toISOString(),
        updated_at: post.data.updatedDate?.toISOString() || new Date().toISOString()
      };
      
      // Save to database
      await createArticle(article);
    }
    
    return {
      success: true,
      message: `Synced ${contentPosts.length} content files to database`
    };
  } catch (error) {
    console.error('Error syncing content to database:', error);
    throw error;
  }
}