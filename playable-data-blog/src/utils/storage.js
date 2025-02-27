import { supabase } from '../db/supabase';
import { marked } from 'marked';
import slugify from 'slugify';

// Bucket name for content storage
const CONTENT_BUCKET = 'content';
const MEDIA_BUCKET = 'media';

// For static builds, always return fallback data
const isBuildTime = import.meta.env.SSR && !import.meta.env.DEV;

/**
 * Initialize storage buckets if they don't exist
 */
export async function initializeStorage() {
  // For static builds, skip initialization
  if (isBuildTime) {
    return true;
  }
  
  try {
    // Check if content bucket exists
    const { data: contentBuckets } = await supabase.storage.listBuckets();
    
    if (!contentBuckets?.find(bucket => bucket.name === CONTENT_BUCKET)) {
      // Create content bucket
      await supabase.storage.createBucket(CONTENT_BUCKET, {
        public: false,
        allowedMimeTypes: ['text/markdown', 'text/plain', 'text/x-markdown'],
        fileSizeLimit: 5242880 // 5MB
      });
    }
    
    if (!contentBuckets?.find(bucket => bucket.name === MEDIA_BUCKET)) {
      // Create media bucket
      await supabase.storage.createBucket(MEDIA_BUCKET, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'],
        fileSizeLimit: 10485760 // 10MB
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
}

/**
 * Upload content to Supabase Storage
 * @param {string} slug - The slug for the content
 * @param {string} content - The markdown content
 * @param {object} metadata - Metadata for the content
 * @returns {Promise<object>} - The upload result
 */
export async function uploadContent(slug, content, metadata = {}) {
  // For static builds, return mock data
  if (isBuildTime) {
    return {
      path: `${slug}.md`,
      url: `https://example.com/mock-storage/${slug}.md`,
      metadata
    };
  }
  
  try {
    // Ensure storage is initialized
    await initializeStorage();
    
    // Create the file path
    const filePath = `${slug}.md`;
    
    // Upload the content
    const { data, error } = await supabase.storage
      .from(CONTENT_BUCKET)
      .upload(filePath, content, {
        contentType: 'text/markdown',
        upsert: true,
        metadata
      });
    
    if (error) throw error;
    
    // Get the public URL
    const { data: urlData } = await supabase.storage
      .from(CONTENT_BUCKET)
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days
    
    return {
      path: filePath,
      url: urlData?.signedUrl || null,
      ...data
    };
  } catch (error) {
    console.error('Error uploading content:', error);
    throw error;
  }
}

/**
 * Get content from Supabase Storage
 * @param {string} slug - The slug for the content
 * @returns {Promise<object>} - The content and metadata
 */
export async function getContent(slug) {
  // For static builds, return placeholder content
  if (isBuildTime) {
    return getPlaceholderContent(slug);
  }
  
  try {
    // Create the file path
    const filePath = `${slug}.md`;
    
    // Get the content
    const { data, error } = await supabase.storage
      .from(CONTENT_BUCKET)
      .download(filePath);
    
    if (error) {
      // For placeholder slug, return placeholder content
      if (slug === 'placeholder') {
        return getPlaceholderContent(slug);
      }
      throw error;
    }
    
    // Convert to text
    const content = await data.text();
    
    // Get metadata
    const { data: metadata } = await supabase.storage
      .from(CONTENT_BUCKET)
      .getPublicUrl(filePath);
    
    return {
      content,
      metadata,
      slug
    };
  } catch (error) {
    console.error(`Error getting content for ${slug}:`, error);
    
    // For placeholder slug, return placeholder content
    if (slug === 'placeholder') {
      return getPlaceholderContent(slug);
    }
    
    throw error;
  }
}

/**
 * Delete content from Supabase Storage
 * @param {string} slug - The slug for the content
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteContent(slug) {
  // For static builds, return success
  if (isBuildTime) {
    return true;
  }
  
  try {
    // Create the file path
    const filePath = `${slug}.md`;
    
    // Delete the content
    const { error } = await supabase.storage
      .from(CONTENT_BUCKET)
      .remove([filePath]);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting content for ${slug}:`, error);
    throw error;
  }
}

/**
 * List all content in Supabase Storage
 * @returns {Promise<Array>} - List of content items
 */
export async function listContent() {
  // For static builds, return empty array
  if (isBuildTime) {
    return [];
  }
  
  try {
    // List all content
    const { data, error } = await supabase.storage
      .from(CONTENT_BUCKET)
      .list();
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error listing content:', error);
    return []; // Return empty array on error
  }
}

/**
 * Upload media to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} folder - The folder to upload to
 * @param {object} metadata - Metadata for the file
 * @returns {Promise<object>} - The upload result
 */
export async function uploadMedia(file, folder = '', metadata = {}) {
  // For static builds, return mock data
  if (isBuildTime) {
    const fileName = typeof file === 'string' ? file : file.name || 'mock-file.jpg';
    return {
      path: folder ? `${folder}/${fileName}` : fileName,
      url: `https://example.com/mock-storage/${folder ? folder + '/' : ''}${fileName}`,
      metadata
    };
  }
  
  try {
    // Ensure storage is initialized
    await initializeStorage();
    
    // Create a safe filename
    const fileName = typeof file === 'string' 
      ? file 
      : slugify(file.name.replace(/\.[^/.]+$/, ""), { 
          lower: true, 
          strict: true 
        }) + '.' + file.name.split('.').pop();
    
    // Create the file path
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(filePath, file, {
        upsert: true,
        metadata
      });
    
    if (error) throw error;
    
    // Get the public URL
    const { data: urlData } = await supabase.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(filePath);
    
    return {
      path: filePath,
      url: urlData?.publicUrl || null,
      ...data
    };
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
}

/**
 * List all media in Supabase Storage
 * @param {string} folder - The folder to list
 * @returns {Promise<Array>} - List of media items
 */
export async function listMedia(folder = '') {
  // For static builds, return mock data
  if (isBuildTime) {
    return [
      { 
        name: 'sample-image-1.jpg', 
        id: '1', 
        created_at: new Date().toISOString(),
        path: folder ? `${folder}/sample-image-1.jpg` : 'sample-image-1.jpg',
        url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c'
      },
      { 
        name: 'sample-image-2.jpg', 
        id: '2', 
        created_at: new Date().toISOString(),
        path: folder ? `${folder}/sample-image-2.jpg` : 'sample-image-2.jpg',
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa'
      },
      { 
        name: 'sample-image-3.jpg', 
        id: '3', 
        created_at: new Date().toISOString(),
        path: folder ? `${folder}/sample-image-3.jpg` : 'sample-image-3.jpg',
        url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3'
      }
    ];
  }
  
  try {
    // List all media
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .list(folder);
    
    if (error) throw error;
    
    // Get public URLs for all media
    const mediaWithUrls = await Promise.all((data || []).map(async (item) => {
      const path = folder ? `${folder}/${item.name}` : item.name;
      const { data: urlData } = await supabase.storage
        .from(MEDIA_BUCKET)
        .getPublicUrl(path);
      
      return {
        ...item,
        path,
        url: urlData?.publicUrl || null
      };
    }));
    
    return mediaWithUrls;
  } catch (error) {
    console.error('Error listing media:', error);
    
    // Return mock data on error
    return [
      { 
        name: 'sample-image-1.jpg', 
        id: '1', 
        created_at: new Date().toISOString(),
        path: folder ? `${folder}/sample-image-1.jpg` : 'sample-image-1.jpg',
        url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c'
      },
      { 
        name: 'sample-image-2.jpg', 
        id: '2', 
        created_at: new Date().toISOString(),
        path: folder ? `${folder}/sample-image-2.jpg` : 'sample-image-2.jpg',
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa'
      }
    ];
  }
}

/**
 * Delete media from Supabase Storage
 * @param {string} path - The path to the media
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteMedia(path) {
  // For static builds, return success
  if (isBuildTime) {
    return true;
  }
  
  try {
    // Delete the media
    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove([path]);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting media at ${path}:`, error);
    throw error;
  }
}

/**
 * Convert article from database to storage format
 * @param {object} article - The article from the database
 * @returns {object} - The content and metadata
 */
export function articleToStorageFormat(article) {
  // Extract metadata
  const metadata = {
    title: article.title,
    description: article.description || '',
    pubDate: article.created_at,
    updatedDate: article.updated_at,
    coverImage: article.cover_image || '',
    author: article.author_name || '',
    tags: article.tags ? article.tags.join(',') : '',
    status: article.status || 'draft'
  };
  
  // Return content and metadata
  return {
    content: article.content || '',
    metadata,
    slug: article.slug
  };
}

/**
 * Convert storage format to article for database
 * @param {object} storageItem - The content and metadata from storage
 * @returns {object} - The article for database
 */
export function storageFormatToArticle(storageItem) {
  const { content, metadata, slug } = storageItem;
  
  // Create article object
  return {
    title: metadata.title || '',
    slug: slug,
    content: content || '',
    description: metadata.description || '',
    cover_image: metadata.coverImage || '',
    tags: metadata.tags ? metadata.tags.split(',').map(tag => tag.trim()) : [],
    status: metadata.status || 'draft',
    author_name: metadata.author || '',
    created_at: metadata.pubDate || new Date().toISOString(),
    updated_at: metadata.updatedDate || new Date().toISOString()
  };
}

/**
 * Migrate content from database to storage
 * @param {Array} articles - The articles from the database
 * @returns {Promise<Array>} - Results of the migration
 */
export async function migrateContentToStorage(articles) {
  // For static builds, return mock results
  if (isBuildTime) {
    return articles.map(article => ({
      slug: article.slug,
      status: 'success',
      message: 'Migrated successfully (mock)'
    }));
  }
  
  try {
    const results = [];
    
    for (const article of articles) {
      try {
        // Convert to storage format
        const storageFormat = articleToStorageFormat(article);
        
        // Upload to storage
        await uploadContent(article.slug, article.content, storageFormat.metadata);
        
        results.push({
          slug: article.slug,
          status: 'success',
          message: 'Migrated successfully'
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
    console.error('Error migrating content to storage:', error);
    throw error;
  }
}

/**
 * Migrate content from files to storage
 * @param {Array} contentFiles - The content files
 * @returns {Promise<Array>} - Results of the migration
 */
export async function migrateFilesToStorage(contentFiles) {
  // For static builds, return mock results
  if (isBuildTime) {
    return contentFiles.map(file => ({
      slug: file.slug,
      status: 'success',
      message: 'Migrated successfully (mock)'
    }));
  }
  
  try {
    const results = [];
    
    for (const file of contentFiles) {
      try {
        // Extract frontmatter and content
        const content = file.body;
        const metadata = {
          title: file.data.title,
          description: file.data.description || '',
          pubDate: file.data.pubDate?.toISOString() || new Date().toISOString(),
          updatedDate: file.data.updatedDate?.toISOString() || '',
          coverImage: file.data.coverImage || '',
          author: file.data.author?.name || '',
          tags: file.data.tags ? file.data.tags.join(',') : '',
          status: 'published'
        };
        
        // Upload to storage
        await uploadContent(file.slug, content, metadata);
        
        results.push({
          slug: file.slug,
          status: 'success',
          message: 'Migrated successfully'
        });
      } catch (error) {
        results.push({
          slug: file.slug,
          status: 'error',
          message: error.message
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error migrating files to storage:', error);
    throw error;
  }
}

// Fallback content for static builds
export function getPlaceholderContent(slug) {
  return {
    content: '# Welcome to Playable Data Blog\n\nWe\'re currently setting up our content. Please check back soon for articles on gaming analytics, data science, and more!',
    metadata: {
      title: 'Welcome to Playable Data Blog',
      description: 'This is a placeholder article while we set up our content.'
    },
    slug
  };
}