import { supabase } from '../db/supabase';
import matter from 'gray-matter';
import { marked } from 'marked';

// Bucket names
const ARTICLES_BUCKET = 'articles';
const MEDIA_BUCKET = 'media';

/**
 * Initialize storage buckets if they don't exist
 */
export async function initializeStorage() {
  try {
    // Check if buckets exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return false;
    }
    
    // Create articles bucket if it doesn't exist
    if (!buckets?.find(bucket => bucket.name === ARTICLES_BUCKET)) {
      const { error: createArticlesError } = await supabase.storage.createBucket(ARTICLES_BUCKET, {
        public: true,
        allowedMimeTypes: ['text/markdown', 'text/plain'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createArticlesError) {
        console.error('Error creating articles bucket:', createArticlesError);
        return false;
      }
    }
    
    // Create media bucket if it doesn't exist
    if (!buckets?.find(bucket => bucket.name === MEDIA_BUCKET)) {
      const { error: createMediaError } = await supabase.storage.createBucket(MEDIA_BUCKET, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createMediaError) {
        console.error('Error creating media bucket:', createMediaError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
}

/**
 * Get article content from storage
 */
export async function getArticleContent(fileName) {
  try {
    const { data, error } = await supabase.storage
      .from(ARTICLES_BUCKET)
      .download(fileName);
      
    if (error) {
      console.error('Error downloading article:', error);
      throw error;
    }
    
    const content = await data.text();
    return content;
  } catch (error) {
    console.error('Error getting article content:', error);
    throw error;
  }
}

/**
 * Parse markdown content with frontmatter
 */
export function parseMarkdown(content) {
  try {
    const { data: frontmatter, content: markdown } = matter(content);
    const html = marked.parse(markdown);
    
    return {
      metadata: frontmatter,
      content: markdown,
      html
    };
  } catch (error) {
    console.error('Error parsing markdown:', error);
    throw error;
  }
}

/**
 * Get all articles from storage
 */
export async function getAllArticles() {
  try {
    await initializeStorage();
    
    const { data: files, error: listError } = await supabase.storage
      .from(ARTICLES_BUCKET)
      .list();
      
    if (listError) {
      console.error('Error listing articles:', listError);
      throw listError;
    }
    
    const articles = await Promise.all(
      files
        .filter(file => file.name.endsWith('.md'))
        .map(async file => {
          try {
            const content = await getArticleContent(file.name);
            const { metadata, html } = parseMarkdown(content);
            
            return {
              ...metadata,
              slug: file.name.replace('.md', ''),
              content: html,
              topics: metadata.topics || metadata.tags || []
            };
          } catch (error) {
            console.error(`Error processing article ${file.name}:`, error);
            return null;
          }
        })
    );
    
    return articles.filter(Boolean); // Remove any failed articles
  } catch (error) {
    console.error('Error getting all articles:', error);
    throw error;
  }
}

/**
 * Upload media file to storage
 */
export async function uploadMedia(file, folder = '') {
  try {
    await initializeStorage();
    
    const fileName = `${folder}/${file.name}`.replace(/^\//, '');
    
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
    
    const { data: { publicUrl }, error: urlError } = supabase.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(fileName);
      
    if (urlError) {
      console.error('Error getting public URL:', urlError);
      throw urlError;
    }
    
    return {
      ...data,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
}

/**
 * Delete media file from storage
 */
export async function deleteMedia(path) {
  try {
    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove([path]);
      
    if (error) {
      console.error('Error deleting media:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting media:', error);
    throw error;
  }
}

/**
 * List all content files in the articles bucket
 */
export async function listContent() {
  try {
    await initializeStorage();
    
    const { data: files, error } = await supabase.storage
      .from(ARTICLES_BUCKET)
      .list();
      
    if (error) {
      console.error('Error listing content:', error);
      throw error;
    }
    
    return files.filter(file => file.name.endsWith('.md'));
  } catch (error) {
    console.error('Error listing content:', error);
    throw error;
  }
}

/**
 * Migrate content from database to storage
 * This function takes an array of database articles and converts them to markdown files
 * stored in the Supabase Storage bucket
 */
export async function migrateContentToStorage(articles) {
  try {
    // Initialize storage
    await initializeStorage();
    
    // Track results
    const results = [];
    
    // Process each article
    for (const article of articles) {
      try {
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
          ...(article.tags && article.tags.length > 0 ? { tags: article.tags } : {})
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
        
        // Get content (if it exists)
        const content = article.content || '';
        
        // Create file name (slug + .md)
        const fileName = `${article.slug}.md`;
        
        // Combine frontmatter and content
        const fileContent = frontmatterStr + content;
        
        // Convert string to Blob
        const blob = new Blob([fileContent], { type: 'text/markdown' });
        const file = new File([blob], fileName, { type: 'text/markdown' });
        
        // Check if file already exists
        const { data: existingFiles } = await supabase.storage
          .from(ARTICLES_BUCKET)
          .list();
          
        const fileExists = existingFiles?.some(f => f.name === fileName);
        
        // Upload to storage
        const { data, error } = await supabase.storage
          .from(ARTICLES_BUCKET)
          .upload(fileName, file, {
            upsert: fileExists // Overwrite if exists
          });
          
        if (error) {
          throw error;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(ARTICLES_BUCKET)
          .getPublicUrl(fileName);
        
        // Add to results
        results.push({
          slug: article.slug,
          title: article.title,
          status: 'success',
          message: fileExists ? 'Updated in storage' : 'Migrated to storage',
          url: publicUrl
        });
      } catch (error) {
        console.error(`Error migrating article ${article.slug}:`, error);
        
        // Add error to results
        results.push({
          slug: article.slug,
          title: article.title,
          status: 'error',
          message: error.message || 'Unknown error'
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error migrating content to storage:', error);
    throw error;
  }
}

/**
 * Get content from storage by slug
 */
export async function getContent(slug) {
  try {
    // Ensure storage is initialized
    await initializeStorage();
    
    // File name is slug + .md
    const fileName = `${slug}.md`;
    
    // Get file from storage
    const { data, error } = await supabase.storage
      .from(ARTICLES_BUCKET)
      .download(fileName);
      
    if (error) {
      console.error(`Error downloading content for ${slug}:`, error);
      throw error;
    }
    
    // Get file content
    const content = await data.text();
    
    // Parse markdown with frontmatter
    const { metadata, html, content: markdown } = parseMarkdown(content);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(ARTICLES_BUCKET)
      .getPublicUrl(fileName);
    
    return {
      slug,
      fileName,
      url: publicUrl,
      content: markdown,
      html,
      metadata
    };
  } catch (error) {
    console.error(`Error getting content for ${slug}:`, error);
    throw error;
  }
}

/**
 * Delete content from storage by slug
 */
export async function deleteContent(slug) {
  try {
    // Ensure storage is initialized
    await initializeStorage();
    
    // File name is slug + .md
    const fileName = `${slug}.md`;
    
    // Delete file from storage
    const { error } = await supabase.storage
      .from(ARTICLES_BUCKET)
      .remove([fileName]);
      
    if (error) {
      console.error(`Error deleting content for ${slug}:`, error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting content for ${slug}:`, error);
    throw error;
  }
}

/**
 * Upload content to storage
 */
export async function uploadContent(slug, content, metadata = {}) {
  try {
    // Ensure storage is initialized
    await initializeStorage();
    
    // Create frontmatter
    const frontmatterObj = {
      title: metadata.title || slug,
      description: metadata.description || '',
      pubDate: metadata.pubDate || new Date().toISOString().split('T')[0],
      ...(metadata.updatedDate ? { updatedDate: metadata.updatedDate } : {}),
      ...(metadata.coverImage ? { coverImage: metadata.coverImage } : {}),
      ...(metadata.author ? { author: metadata.author } : {}),
      ...(metadata.tags && metadata.tags.length > 0 ? { tags: metadata.tags } : {})
    };
    
    // Format frontmatter as YAML
    const frontmatterStr = `---\n${Object.entries(frontmatterObj)
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
    const fileContent = frontmatterStr + (content || '');
    
    // Create file name (slug + .md)
    const fileName = `${slug}.md`;
    
    // Convert string to Blob
    const blob = new Blob([fileContent], { type: 'text/markdown' });
    const file = new File([blob], fileName, { type: 'text/markdown' });
    
    // Upload to storage
    const { data, error } = await supabase.storage
      .from(ARTICLES_BUCKET)
      .upload(fileName, file, {
        upsert: true // Overwrite if exists
      });
      
    if (error) {
      console.error(`Error uploading content "${slug}":`, error);
      throw error;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(ARTICLES_BUCKET)
      .getPublicUrl(fileName);
    
    return {
      slug,
      fileName,
      url: publicUrl
    };
  } catch (error) {
    console.error(`Error uploading content "${slug}":`, error);
    throw error;
  }
}

/**
 * List media files in storage
 */
export async function listMedia(folder = '') {
  try {
    // Ensure storage is initialized
    await initializeStorage();
    
    // List files in folder
    const { data: files, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .list(folder);
      
    if (error) {
      console.error(`Error listing media in folder "${folder}":`, error);
      throw error;
    }
    
    // Get public URLs for all files
    const mediaFiles = files.map(file => {
      const filePath = folder ? `${folder}/${file.name}` : file.name;
      const { data: { publicUrl } } = supabase.storage
        .from(MEDIA_BUCKET)
        .getPublicUrl(filePath);
        
      return {
        ...file,
        path: filePath,
        url: publicUrl
      };
    });
    
    return mediaFiles;
  } catch (error) {
    console.error(`Error listing media in folder "${folder}":`, error);
    throw error;
  }
}

/**
 * Convert database article to storage format
 */
export function articleToStorageFormat(article) {
  // Extract metadata for frontmatter
  const metadata = {
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
    ...(article.tags && article.tags.length > 0 ? { tags: article.tags } : {})
  };
  
  return {
    slug: article.slug,
    content: article.content || '',
    metadata
  };
}