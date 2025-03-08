import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false // Since we're running in SSG mode
      },
      storage: {
        retryInterval: 500,
        maxRetries: 3
      }
    });
  } else {
    console.warn('Missing Supabase credentials. Running in fallback mode.');
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
}

export { supabase };