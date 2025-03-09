import { supabase } from '../db/supabase';
import { DEFAULT_TOPICS } from './topics';

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
  try {
    // If Supabase is not initialized, return mock data
    if (!supabase) {
      console.warn('Using mock article data (Supabase not initialized)');
      return MOCK_ARTICLES;
    }

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
    
    return data.map(article => ({
      ...article,
      topics: article.topics || article.tags || DEFAULT_TOPICS
    }));
  } catch (error) {
    console.error('Error fetching articles:', error);
    // If there's an error, return mock data instead of throwing
    console.warn('Using mock article data due to error');
    return MOCK_ARTICLES;
  }
}

export async function getArticleById(id) {
  try {
    // If Supabase is not initialized, return mock data
    if (!supabase) {
      console.warn('Using mock article data (Supabase not initialized)');
      const mockArticle = MOCK_ARTICLES.find(a => a.id === id || a.slug === id);
      if (mockArticle) return mockArticle;
      throw new Error('Article not found in mock data');
    }

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq(id.includes('-') ? 'id' : 'slug', id)
      .single();
      
    if (error) {
      console.error(`Error getting article by ID/slug ${id}:`, error);
      throw error;
    }
    
    return {
      ...data,
      topics: data.topics || data.tags || DEFAULT_TOPICS
    };
  } catch (error) {
    console.error(`Error getting article by ID/slug ${id}:`, error);
    
    // For getArticleById, we still throw because we don't want to 
    // return an incorrect article, but log a more helpful error message
    if (!supabase) {
      throw new Error(`Article with ID/slug "${id}" not found (Supabase not initialized)`);
    }
    
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function signIn(email, password) {
  try {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not initialized') };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  } catch (error) {
    console.error('Error signing in:', error);
    return { data: null, error };
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