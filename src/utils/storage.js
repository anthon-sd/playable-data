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