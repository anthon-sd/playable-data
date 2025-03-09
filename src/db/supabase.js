import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Check if the API key format is valid (basic format check)
function isValidApiKey(key) {
  // Supabase keys are JWT tokens that should follow this format
  return typeof key === 'string' && 
         key.split('.').length === 3 && 
         key.length > 30; // Arbitrary minimum length
}

// Initialize with null - we'll only use Supabase if credentials check out
let supabase = null;

// Only attempt initialization if environment variables look valid
if (supabaseUrl && 
    supabaseUrl.includes('supabase.co') && 
    isValidApiKey(supabaseAnonKey)) {
  
  try {
    console.log('Initializing Supabase client with valid credentials');
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false // Since we're running in SSG mode
      },
      storage: {
        retryInterval: 500,
        maxRetries: 3
      }
    });
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    supabase = null;
  }
} else {
  console.warn('Invalid or missing Supabase credentials detected. Running in fallback mode.');
  console.warn('Site will build with mock data instead of live Supabase data.');
  supabase = null;
}

export { supabase };