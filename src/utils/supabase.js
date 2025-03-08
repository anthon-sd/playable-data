import { supabase } from '../db/supabase';
import { DEFAULT_TOPICS } from './topics';

export async function getArticles() {
  try {
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
    throw error;
  }
}

export async function getArticleById(id) {
  try {
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