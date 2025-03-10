import { supabase } from '../db/supabase';
import { DEFAULT_TOPICS } from './topics';
import { getAllArticles as getArticlesFromStorage, getArticleContent, parseMarkdown } from './storage';

// Mock data for when Supabase is not initialized
const MOCK_ARTICLES = [
  {
    id: 'placeholder-1',
    title: 'Getting Started with Analytics',
    slug: 'getting-started',
    content: 'This is placeholder content for when Supabase is not available.',
    description: 'A guide to getting started with analytics in your games.',
    cover_image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
    tags: ['analytics', 'beginners'],
    topics: ['analytics', 'beginners', 'games'],
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'placeholder-2',
    title: 'Advanced Analytics Techniques',
    slug: 'advanced-analytics',
    content: 'This is another placeholder article for when Supabase is unavailable.',
    description: 'Learn advanced analytics techniques for game development.',
    cover_image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
    tags: ['analytics', 'advanced'],
    topics: ['analytics', 'advanced', 'games'],
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function getArticles() {
  // If Supabase is not initialized, return mock data immediately
  if (!supabase) {
    console.info('Supabase client not available, using mock article data');
    return MOCK_ARTICLES;
  }
  
  try {
    // Double-check Supabase is actually a valid client before attempting the query
    if (!supabase.storage) {
      console.warn('Invalid Supabase client, using mock article data');
      return MOCK_ARTICLES;
    }
    
    try {
      // Fetch articles from storage bucket
      const articles = await getArticlesFromStorage();
      
      if (!articles || articles.length === 0) {
        console.warn('No articles found in storage bucket, using mock data');
        return MOCK_ARTICLES;
      }
      
      // Format articles to match expected structure
      return articles.map(article => ({
        id: article.slug || `article-${Math.random().toString(36).substring(2, 11)}`,
        slug: article.slug,
        title: article.title,
        description: article.description,
        content: article.content,
        cover_image: article.cover_image,
        tags: article.tags || [],
        topics: article.topics || article.tags || DEFAULT_TOPICS,
        status: article.status || 'published',
        created_at: article.pubDate || new Date().toISOString(),
        updated_at: article.updatedDate || article.pubDate || new Date().toISOString(),
        author: article.author || { name: 'Playable Data Team' },
        author_name: article.author_name || (article.author && article.author.name) || 'Playable Data Team',
        author_id: article.author_id || (article.author && article.author.id),
        author_image: article.author_image || (article.author && article.author.image),
        featured: article.featured === true || article.featured === 'true' || false
      }));
    } catch (storageError) {
      console.error('Error fetching articles from storage:', storageError);
      return MOCK_ARTICLES;
    }
  } catch (error) {
    console.error('Error in getArticles:', error);
    return MOCK_ARTICLES;
  }
}

export async function getArticleById(id) {
  // If Supabase is not initialized, return mock data
  if (!supabase) {
    console.info('Supabase client not available, using mock article data for ID:', id);
    // Find a mock article with matching ID or return the first one
    return MOCK_ARTICLES.find(article => article.id === id || article.slug === id) || MOCK_ARTICLES[0];
  }
  
  try {
    // Double-check Supabase is actually a valid client
    if (!supabase.storage) {
      console.warn('Invalid Supabase client, using mock article data');
      return MOCK_ARTICLES.find(article => article.id === id || article.slug === id) || MOCK_ARTICLES[0];
    }
    
    try {
      // Assuming id might be a slug
      const fileName = `${id}.md`;
      
      // Get the article content from storage
      const content = await getArticleContent(fileName);
      
      // Parse the markdown content
      const { metadata, html } = parseMarkdown(content);
      
      // Format the article to match expected structure
      return {
        id: id,
        slug: id,
        title: metadata.title,
        description: metadata.description,
        content: html,
        cover_image: metadata.cover_image,
        tags: metadata.tags || [],
        topics: metadata.topics || metadata.tags || DEFAULT_TOPICS,
        status: metadata.status || 'published',
        created_at: metadata.pubDate || new Date().toISOString(),
        updated_at: metadata.updatedDate || metadata.pubDate || new Date().toISOString(),
        author: metadata.author || { name: 'Playable Data Team' },
        author_name: metadata.author_name || (metadata.author && metadata.author.name) || 'Playable Data Team',
        author_id: metadata.author_id || (metadata.author && metadata.author.id),
        author_image: metadata.author_image || (metadata.author && metadata.author.image),
        featured: metadata.featured === true || metadata.featured === 'true' || false
      };
    } catch (storageError) {
      console.error(`Error fetching article ${id} from storage:`, storageError);
      
      // Fallback to getting all articles and finding the right one
      try {
        const allArticles = await getArticles();
        const article = allArticles.find(article => article.id === id || article.slug === id);
        
        if (article) {
          return article;
        }
        
        console.warn(`Article with ID/slug "${id}" not found in storage or collection`);
        return MOCK_ARTICLES[0];
      } catch (fallbackError) {
        console.error('Error in fallback article fetch:', fallbackError);
        return MOCK_ARTICLES.find(article => article.id === id || article.slug === id) || MOCK_ARTICLES[0];
      }
    }
  } catch (error) {
    console.error(`Error in getArticleById for id ${id}:`, error);
    return MOCK_ARTICLES.find(article => article.id === id || article.slug === id) || MOCK_ARTICLES[0];
  }
}

export async function getCurrentUser() {
  // If Supabase is not initialized, return null
  if (!supabase || !supabase.auth) {
    console.info('Supabase client not available or auth not initialized, no user available');
    return null;
  }
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting current user session:', error);
      return null;
    }
    
    return data?.session?.user || null;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

export async function signIn(email, password) {
  // If using service_role key for build, auth endpoints still work 
  // but we should improve error handling
  try {
    if (!supabase || !supabase.auth) {
      throw new Error('Supabase auth not initialized');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    if (!supabase) {
      return { error: new Error('Supabase not initialized') };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
}

/**
 * Create a new article in the database
 */
export async function createArticle(articleData) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .insert([{
        ...articleData,
        created_at: articleData.created_at || new Date().toISOString(),
        updated_at: articleData.updated_at || new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating article:', error);
      throw error;
    }
    
    return {
      ...data,
      topics: data.topics || data.tags || DEFAULT_TOPICS
    };
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
}

/**
 * Update an existing article in the database
 */
export async function updateArticle(id, articleData) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .update({
        ...articleData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating article ${id}:`, error);
      throw error;
    }
    
    return {
      ...data,
      topics: data.topics || data.tags || DEFAULT_TOPICS
    };
  } catch (error) {
    console.error(`Error updating article ${id}:`, error);
    throw error;
  }
}

// Add a function to check if we're using a service_role key
export function isUsingServiceRole() {
  if (!supabase) return false;
  
  try {
    // Try to decode the JWT to check if it's a service_role key
    const token = supabase.auth.autoRefreshToken?.currentSession?.access_token || 
                 supabase.supabaseKey;
    
    if (!token) return false;
    
    // If token contains a "." it's likely a JWT
    if (typeof token === 'string' && token.split('.').length === 3) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'service_role';
    }
    
    return false;
  } catch (e) {
    return false;
  }
}