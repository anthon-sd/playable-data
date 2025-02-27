import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

// Create the Supabase client with caching and performance options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (...args) => fetch(...args)
  },
  realtime: {
    timeout: 30000 // Increase timeout for better reliability
  }
});

// Memoization cache for frequently used queries
const memoCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Memoized function to reduce duplicate API calls
 * @param {Function} fn - The function to memoize
 * @param {string} key - Cache key
 * @param {Array} args - Function arguments
 * @returns {Promise<any>} - Function result
 */
async function memoize(fn, key, ...args) {
  const cacheKey = `${key}:${JSON.stringify(args)}`;
  const cached = memoCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const result = await fn(...args);
  memoCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserRole(userId) {
  return memoize(async (id) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', id)
      .single();
      
    if (error) return null;
    return data?.role;
  }, 'getUserRole', userId);
}

export async function getArticles() {
  return memoize(async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  }, 'getArticles');
}

export async function getArticleById(id) {
  return memoize(async (articleId) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();
        
      if (error) {
        // Try by slug if ID fails
        const { data: dataBySlug, error: errorBySlug } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', articleId)
          .single();
          
        if (errorBySlug) throw error;
        return dataBySlug;
      }
      
      return data;
    } catch (error) {
      console.error(`Error getting article by ID/slug ${articleId}:`, error);
      throw error;
    }
  }, 'getArticleById', id);
}

export async function createArticle(article) {
  const { data, error } = await supabase
    .from('articles')
    .insert([article])
    .select();
    
  if (error) throw error;
  
  // Clear cache after mutation
  memoCache.clear();
  
  return data[0];
}

export async function updateArticle(id, updates) {
  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select();
    
  if (error) throw error;
  
  // Clear cache after mutation
  memoCache.clear();
  
  return data[0];
}

export async function deleteArticle(id) {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  
  // Clear cache after mutation
  memoCache.clear();
  
  return true;
}

// Clear cache periodically to prevent stale data
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      memoCache.delete(key);
    }
  }
}, CACHE_TTL);