import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    console.log('Initializing Supabase client with URL:', supabaseUrl);
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false // Since we're running in SSG mode
      },
      storage: {
        retryInterval: 500,
        maxRetries: 3
      }
    });
    
    // Test connection with a simple query to verify credentials
    (async function testConnection() {
      try {
        const { error } = await supabase.from('articles').select('count', { count: 'exact', head: true });
        if (error) {
          console.warn('Supabase API key validation failed:', error.message);
          supabase = null; // Reset to null so app falls back to mock data
        } else {
          console.log('Successfully connected to Supabase');
        }
      } catch (e) {
        console.warn('Supabase connection test failed:', e.message);
        supabase = null; // Reset to null so app falls back to mock data
      }
    })();
  } else {
    console.warn('Missing Supabase credentials. Running in fallback mode.');
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  supabase = null; // Ensure we fallback to mock data
}

export { supabase };