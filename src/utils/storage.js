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
    console.log(`Fetching article content for: ${fileName}`);
    
    // Handle potential URL-encoding in the filename
    const normalizedFileName = decodeURIComponent(fileName);
    
    // Attempt to download the file
    const { data, error } = await supabase.storage
      .from(ARTICLES_BUCKET)
      .download(normalizedFileName);
      
    if (error) {
      console.error(`Error downloading article "${normalizedFileName}":`, error);
      
      // Try alternative approach if the file might have spaces or special characters
      if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
        console.log(`Trying alternative encoding for filename: ${fileName}`);
        
        // List all files and find a close match
        const { data: files } = await supabase.storage
          .from(ARTICLES_BUCKET)
          .list();
          
        if (files && files.length > 0) {
          // Look for close matches (ignoring case, etc.)
          const possibleMatch = files.find(file => 
            file.name.toLowerCase() === fileName.toLowerCase() ||
            file.name.replace(/\s+/g, '') === fileName.replace(/\s+/g, '')
          );
          
          if (possibleMatch) {
            console.log(`Found possible match: ${possibleMatch.name}`);
            const { data: matchData, error: matchError } = await supabase.storage
              .from(ARTICLES_BUCKET)
              .download(possibleMatch.name);
              
            if (matchError) {
              console.error(`Error downloading possible match "${possibleMatch.name}":`, matchError);
              throw matchError;
            }
            
            const content = await matchData.text();
            return content;
          }
        }
      }
      
      throw error;
    }
    
    // Convert the blob to text
    const content = await data.text();
    
    // Quick validation that the content looks like a markdown file with frontmatter
    if (!content.trim().startsWith('---')) {
      console.warn(`File ${fileName} doesn't appear to have valid frontmatter`);
    }
    
    return content;
  } catch (error) {
    console.error(`Error getting content for article "${fileName}":`, error);
    throw error;
  }
}

/**
 * Parse markdown content with frontmatter
 */
export function parseMarkdown(content) {
  try {
    // Check for known problematic patterns in frontmatter
    const hasTitleWithColon = /^title:.*?:.*?$/m.test(content);
    const hasDescriptionWithColon = /^description:.*?:.*?$/m.test(content);
    const hasAuthor = /^author:[\s\S]*?\n[^\s]/m.test(content);
    
    // If we detect problematic patterns or an author field, use our custom parser
    if (hasTitleWithColon || hasDescriptionWithColon || hasAuthor) {
      console.log('Detected YAML with special characters or nested objects, using custom parser');
      
      // Extract frontmatter between --- delimiters
      const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      
      if (frontmatterMatch && frontmatterMatch[1]) {
        const frontmatterText = frontmatterMatch[1];
        const frontmatterLines = frontmatterText.split('\n');
        const metadata = {};
        
        // Process each line manually
        let currentKey = null;
        let currentValue = null;
        let inMultiline = false;
        
        frontmatterLines.forEach(line => {
          line = line.trim();
          
          // Skip empty lines
          if (!line) return;
          
          // Check if this is a new key
          const keyMatch = line.match(/^([^:]+):\s*(.*)/);
          
          if (keyMatch && !inMultiline) {
            currentKey = keyMatch[1].trim();
            currentValue = keyMatch[2].trim();
            
            // Handle specific keys with special processing
            if (currentKey === 'title' || currentKey === 'description') {
              // For title and description, take the whole line after the first colon
              currentValue = line.substring(line.indexOf(':') + 1).trim();
            }
            
            // Check if this is the start of a multiline value (like an author object)
            if (!currentValue) {
              inMultiline = true;
              metadata[currentKey] = {};
            } 
            // Check if this is an array value
            else if (currentValue.startsWith('[') && currentValue.endsWith(']')) {
              try {
                // Try to parse as JSON array
                metadata[currentKey] = JSON.parse(currentValue);
              } catch (e) {
                // Fallback: simple string splitting for arrays
                metadata[currentKey] = currentValue.replace(/[\[\]"']/g, '').split(',').map(s => s.trim());
              }
            }
            // Regular string value
            else {
              metadata[currentKey] = currentValue;
            }
          } 
          // Handle multiline values (like nested objects)
          else if (inMultiline && currentKey) {
            const nestedMatch = line.match(/^\s+([^:]+):\s*(.*)/);
            if (nestedMatch) {
              const nestedKey = nestedMatch[1].trim();
              const nestedValue = nestedMatch[2].trim();
              
              // Handle nested values with special characters by keeping quotes
              if (nestedValue.startsWith('"') && nestedValue.endsWith('"')) {
                metadata[currentKey][nestedKey] = nestedValue.substring(1, nestedValue.length - 1);
              } else {
                metadata[currentKey][nestedKey] = nestedValue;
              }
              
              // Special debug for author fields
              if (currentKey === 'author') {
                console.log(`Parsed author.${nestedKey} = ${nestedValue}`);
                // Make sure image URLs are preserved exactly as written
                if (nestedKey === 'image' && nestedValue.includes('://')) {
                  console.log(`Found author image URL: ${nestedValue}`);
                  // Strip any quotes that may have been added
                  metadata[currentKey][nestedKey] = nestedValue.replace(/^["']|["']$/g, '');
                }
              }
            } else if (!line.trim().startsWith('-')) {
              // End of multiline if not a list item (starting with -)
              inMultiline = false;
            }
          }
        });
        
        // Handle special case for author field which might need normalization
        if (metadata.author && typeof metadata.author === 'string') {
          // If author is a string, convert it to an object with name property
          metadata.author = { name: metadata.author };
        }
        
        // Additional check for author as an object
        if (metadata.author && typeof metadata.author === 'object') {
          console.log('Author object found in frontmatter:', JSON.stringify(metadata.author, null, 2));
        }
        
        // Get the content part (everything after frontmatter)
        const markdownContent = content.replace(/^---[\s\S]*?---/, '').trim();
        const html = marked.parse(markdownContent);
        
        return {
          metadata,
          content: markdownContent,
          html
        };
      }
    }
    
    // If no special patterns detected, or if our custom parsing failed, try standard approach
    // Pre-process content to handle YAML syntax issues
    const preprocessedContent = content
      .replace(/^(title:)(.*?):(.*?)$/m, 'title: "$2:$3"') // Quote titles with colons 
      .replace(/^(description:)(.*?):(.*?)$/m, 'description: "$2:$3"'); // Quote descriptions with colons
    
    // Use matter with default options
    const { data: frontmatter, content: markdown } = matter(preprocessedContent);
    
    // Additional logging for debugging author image
    if (frontmatter.author && typeof frontmatter.author === 'object' && frontmatter.author.image) {
      console.log(`Standard parser found author image: ${frontmatter.author.image}`);
    }
    
    // Handle special case for author field which might need normalization
    if (frontmatter.author && typeof frontmatter.author === 'string') {
      // If author is a string, convert it to an object with name property
      frontmatter.author = { name: frontmatter.author };
    }
    
    const html = marked.parse(markdown);
    
    return {
      metadata: frontmatter,
      content: markdown,
      html
    };
  } catch (error) {
    console.error('Error parsing markdown:', error);
    // Provide a minimal fallback for parsing errors
    return {
      metadata: {
        title: "Error parsing document",
        description: "This document could not be properly parsed.",
        status: "draft",
        author: { name: 'Playable Data Team' }
      },
      content: content.replace(/^---[\s\S]*?---/, '').trim(), // Remove frontmatter attempt
      html: marked.parse(content.replace(/^---[\s\S]*?---/, '').trim())
    };
  }
}

/**
 * Normalize author information to ensure consistent format
 * @param {any} author - The author information which might be in different formats
 * @returns {Object} - Normalized author object with name and optional image
 */
function normalizeAuthor(author) {
  // For debugging
  console.log('Normalizing author data:', JSON.stringify(author));
  
  // Default image URL to use when none is specified
  const defaultImage = '/images/default-avatar.svg'; // Using existing default avatar
  
  if (!author) {
    console.log('No author provided, using default');
    return { 
      name: 'Playable Data Team',
      image: defaultImage 
    };
  }
  
  // If author is a string, convert to object
  if (typeof author === 'string') {
    console.log('Author is string, converting to object');
    return { 
      name: author,
      image: defaultImage 
    };
  }
  
  // If author is already an object with a name property, use it
  if (typeof author === 'object' && author.name) {
    // Log the author image if present
    if (author.image) {
      console.log(`Author ${author.name} has specified image URL: ${author.image}`);
    } else if (author.avatar) {
      console.log(`Author ${author.name} has specified avatar URL: ${author.avatar}`);
    } else if (author.picture) {
      console.log(`Author ${author.name} has specified picture URL: ${author.picture}`);
    } else {
      console.log(`Author ${author.name} has no image specified, using default: ${defaultImage}`);
    }
    
    const authorImage = author.image || author.avatar || author.picture || defaultImage;
    
    return {
      name: author.name,
      image: authorImage,
      id: author.id || null
    };
  }
  
  // Default fallback
  console.log('Author data invalid, using default');
  return { 
    name: 'Playable Data Team',
    image: defaultImage 
  };
}

/**
 * Get all articles from storage
 */
export async function getAllArticles() {
  try {
    // If Supabase is not initialized, return empty array
    if (!supabase) {
      console.warn('Supabase not initialized, cannot list articles');
      return [];
    }
    
    // Test our author image parsing with a sample markdown
    const testMarkdown = `---
title: Test Article with Author Image
description: This is a test article to verify author image handling
pubDate: 2023-06-15
author:
  name: Test Author
  image: https://example.com/test-author-image.jpg
  id: test123
tags: [test, image]
---

# Test Article`;

    console.log('Running author image parsing test...');
    testAuthorImageParsing(testMarkdown);
    
    await initializeStorage();
    
    const { data: files, error: listError } = await supabase.storage
      .from(ARTICLES_BUCKET)
      .list();
      
    if (listError) {
      console.error('Error listing articles:', listError);
      throw listError;
    }
    
    if (!files || files.length === 0) {
      console.warn('No markdown files found in storage bucket');
      return [];
    }
    
    const mdFiles = files.filter(file => file.name.endsWith('.md'));
    console.log(`Found ${mdFiles.length} markdown files in articles bucket. Processing files...`);
    
    const articles = await Promise.all(
      mdFiles.map(async file => {
        try {
          // Log which file we're processing for debugging
          console.log(`Processing article: ${file.name}`);
          
          // Get the content of the markdown file
          const content = await getArticleContent(file.name);
          
          // Parse the markdown content with frontmatter
          const { metadata, html } = parseMarkdown(content);
          
          // Special debug logging for monetization article
          if (file.name.includes('Monetisation')) {
            console.log('MONETIZATION ARTICLE FOUND!');
            console.log('Raw metadata:', JSON.stringify(metadata, null, 2));
            console.log('Author from metadata:', JSON.stringify(metadata.author, null, 2));
          }
          
          // Generate a slug from the filename (removing .md extension)
          const slug = file.name.replace(/\.md$/, '');
          
          // Normalize author information
          const normalizedAuthor = normalizeAuthor(metadata.author);
          
          // Additional debug for monetization article
          if (file.name.includes('Monetisation')) {
            console.log('Normalized author:', JSON.stringify(normalizedAuthor, null, 2));
          }
          
          // Ensure required fields exist with sensible defaults
          return {
            id: slug,
            slug: slug,
            title: metadata.title || file.name.replace(/\.md$/, '').replace(/-/g, ' '),
            description: metadata.description || '',
            content: html,
            tags: metadata.tags || [],
            topics: metadata.topics || metadata.tags || [],
            cover_image: metadata.cover_image || '',
            pubDate: metadata.pubDate || new Date().toISOString(),
            updatedDate: metadata.updatedDate || metadata.pubDate || new Date().toISOString(),
            featured: metadata.featured || false,
            status: metadata.status || 'published',
            author: normalizedAuthor
          };
        } catch (articleError) {
          // Log the error but don't halt processing of other articles
          console.error(`Error processing article ${file.name}:`, articleError);
          
          // Return a placeholder for this article to prevent the whole array from failing
          return {
            id: file.name.replace(/\.md$/, ''),
            slug: file.name.replace(/\.md$/, ''),
            title: `Error: ${file.name}`,
            description: 'This article could not be processed due to an error.',
            content: '<p>There was an error processing this article. The content is temporarily unavailable.</p>',
            tags: [],
            topics: [],
            cover_image: '',
            pubDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            featured: false,
            status: 'draft',
            author: { name: 'Playable Data Team' }
          };
        }
      })
    );
    
    const validArticles = articles.filter(article => 
      article && article.status !== 'draft' && article.title !== 'Error parsing document'
    );
    console.log(`Successfully processed ${validArticles.length} valid articles from storage`);
    
    // Sort articles by date, newest first
    return validArticles.sort((a, b) => {
      const dateA = new Date(a.pubDate);
      const dateB = new Date(b.pubDate);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error getting all articles:', error);
    console.warn('Returning empty array due to error in getAllArticles');
    return [];
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
 * List all media files in the media bucket
 * @param {string} folder - Optional folder path to list files from
 * @returns {Promise<Array>} - Array of media files with metadata
 */
export async function listMedia(folder = '') {
  try {
    await initializeStorage();
    
    const { data: files, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .list(folder);
      
    if (error) {
      console.error('Error listing media:', error);
      throw error;
    }
    
    // Get URLs for each file
    const mediaWithUrls = await Promise.all(
      files.filter(file => !file.id.endsWith('/')).map(async (file) => {
        const path = folder ? `${folder}/${file.name}` : file.name;
        const { data: { publicUrl } } = supabase.storage
          .from(MEDIA_BUCKET)
          .getPublicUrl(path);
          
        return {
          ...file,
          url: publicUrl
        };
      })
    );
    
    return mediaWithUrls;
  } catch (error) {
    console.error('Error listing media:', error);
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
 * Test function to verify author image parsing
 * @param {string} markdownContent - Raw markdown content to test
 */
export function testAuthorImageParsing(markdownContent) {
  console.log('=== TESTING AUTHOR IMAGE PARSING ===');
  const { metadata } = parseMarkdown(markdownContent);
  
  console.log('Raw parsed metadata author:', JSON.stringify(metadata.author, null, 2));
  
  const normalizedAuthor = normalizeAuthor(metadata.author);
  console.log('Normalized author:', JSON.stringify(normalizedAuthor, null, 2));
  
  if (normalizedAuthor.image && normalizedAuthor.image.includes('://')) {
    console.log('✅ SUCCESS: Author image URL was correctly preserved:', normalizedAuthor.image);
  } else if (normalizedAuthor.image === '/images/default-avatar.svg') {
    console.log('❌ FAILED: Using default image instead of author image from markdown');
  } else {
    console.log('❓ UNKNOWN: Author image result:', normalizedAuthor.image);
  }
  console.log('==============================');
  
  return {
    rawAuthor: metadata.author,
    normalizedAuthor
  };
}