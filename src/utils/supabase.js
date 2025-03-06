import { supabase } from '../db/supabase';

// Fallback data for static builds
const FALLBACK_ARTICLES = [
  {
    id: '1',
    title: 'Getting Started with Game Analytics',
    slug: 'getting-started-with-game-analytics',
    description: 'Learn the fundamentals of game analytics and how to implement tracking in your games.',
    status: 'published',
    author_name: 'Playable Data Team',
    created_at: '2023-12-10T00:00:00.000Z',
    updated_at: '2023-12-10T00:00:00.000Z',
    cover_image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    tags: ['analytics', 'game-development', 'data'],
    content: '# Getting Started with Game Analytics\n\nGame analytics is essential for understanding player behavior and improving your games...'
  },
  {
    id: '2',
    title: 'Player Retention Strategies',
    slug: 'player-retention-strategies',
    description: 'Discover effective strategies to keep players engaged and coming back to your game.',
    status: 'published',
    author_name: 'Playable Data Team',
    created_at: '2023-12-15T00:00:00.000Z',
    updated_at: '2023-12-15T00:00:00.000Z',
    cover_image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    tags: ['retention', 'game-design', 'monetization'],
    featured: true,
    content: '# Player Retention Strategies\n\nRetaining players is crucial for the long-term success of your game...'
  },
  {
    id: '3',
    title: 'Monetization Models for Indie Games',
    slug: 'monetization-models-for-indie-games',
    description: 'Explore different monetization approaches that work well for indie game developers.',
    status: 'published',
    author_name: 'Playable Data Team',
    created_at: '2023-12-20T00:00:00.000Z',
    updated_at: '2023-12-20T00:00:00.000Z',
    cover_image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    tags: ['monetization', 'indie', 'business'],
    featured: true,
    content: '# Monetization Models for Indie Games\n\nChoosing the right monetization model is critical for indie game success...'
  }
];

export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  } catch (error) {
    console.error('Error signing in:', error);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getUserRole(userId) {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
      
    if (error) return null;
    return data?.role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function getArticles() {
  // For static builds, always return fallback data
  if (import.meta.env.SSR && !import.meta.env.DEV) {
    return FALLBACK_ARTICLES;
  }
  
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching articles:', error);
      return FALLBACK_ARTICLES;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    return FALLBACK_ARTICLES;
  }
}

export async function getArticleById(id) {
  // For static builds, return fallback data
  if (import.meta.env.SSR && !import.meta.env.DEV) {
    const article = FALLBACK_ARTICLES.find(a => a.id === id || a.slug === id);
    if (article) return article;
    
    if (id === 'placeholder') {
      return {
        slug: 'placeholder',
        title: 'Welcome to Playable Data Blog',
        description: 'This is a placeholder article while we set up our content.',
        content: '# Welcome to Playable Data Blog\n\nWe\'re currently setting up our content. Please check back soon for articles on gaming analytics, data science, and more!',
        created_at: new Date().toISOString(),
        tags: ['welcome']
      };
    }
    
    // Return the first fallback article if no match
    return FALLBACK_ARTICLES[0];
  }
  
  try {
    // Try by ID first
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      // Try by slug if ID fails
      const { data: dataBySlug, error: errorBySlug } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', id)
        .single();
        
      if (errorBySlug) {
        // Return placeholder for 'placeholder' slug
        if (id === 'placeholder') {
          return {
            slug: 'placeholder',
            title: 'Welcome to Playable Data Blog',
            description: 'This is a placeholder article while we set up our content.',
            content: '# Welcome to Playable Data Blog\n\nWe\'re currently setting up our content. Please check back soon for articles on gaming analytics, data science, and more!',
            created_at: new Date().toISOString(),
            tags: ['welcome']
          };
        }
        
        // Try to find in fallback data
        const fallbackArticle = FALLBACK_ARTICLES.find(a => a.id === id || a.slug === id);
        if (fallbackArticle) return fallbackArticle;
        
        throw errorBySlug;
      }
      return dataBySlug;
    }
    
    return data;
  } catch (error) {
    console.error(`Error getting article by ID/slug ${id}:`, error);
    
    // Return placeholder for 'placeholder' slug
    if (id === 'placeholder') {
      return {
        slug: 'placeholder',
        title: 'Welcome to Playable Data Blog',
        description: 'This is a placeholder article while we set up our content.',
        content: '# Welcome to Playable Data Blog\n\nWe\'re currently setting up our content. Please check back soon for articles on gaming analytics, data science, and more!',
        created_at: new Date().toISOString(),
        tags: ['welcome']
      };
    }
    
    // Return the first fallback article if no match
    return FALLBACK_ARTICLES[0];
  }
}

export async function createArticle(article) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .insert([article])
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
}

export async function updateArticle(id, updates) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
}

export async function deleteArticle(id) {
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
}