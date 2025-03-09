import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Check if the API key format is valid (basic format check)
function isValidApiKey(key) {
  // Supabase keys are JWT tokens that should follow this format
  if (typeof key !== 'string' || key.split('.').length !== 3) {
    return false;
  }
  
  try {
    // Try to decode the JWT payload to validate it contains expected fields
    const payload = JSON.parse(atob(key.split('.')[1]));
    return payload.iss === 'supabase' && 
           (payload.role === 'anon' || payload.role === 'service_role') &&
           payload.exp > Date.now() / 1000; // Check if not expired
  } catch (e) {
    console.warn('Invalid JWT format in Supabase key');
    return false;
  }
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
        persistSession: false, // Since we're running in SSG mode
        autoRefreshToken: false // No need to refresh for service_role
      },
      storage: {
        retryInterval: 500,
        maxRetries: 3
      }
    });
    
    // Log info about the key being used (but not the full key)
    try {
      const payload = JSON.parse(atob(supabaseAnonKey.split('.')[1]));
      console.log(`Using Supabase ${payload.role} key for project ref: ${payload.ref}`);
    } catch (e) {
      // Silent catch - just for logging
    }
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