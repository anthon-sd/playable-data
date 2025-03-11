import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ganoqvjleaxfbcmzqaww.supabase.co";
// Prioritize service role key for builds (Netlify) but fallback to anon key for client-side
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdhbm9xdmpsZWF4ZmJjbXpxYXd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDY0OTE5NCwiZXhwIjoyMDU2MjI1MTk0fQ.iKu9B2-Sy84eIS9FD7qolsjEdVSy4JVxdPBv8wrMtzk";
// Use service role key if available (for builds), otherwise use anon key
const supabaseKey = supabaseServiceRoleKey ;

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
if (supabaseUrl.includes('supabase.co') && 
    isValidApiKey(supabaseKey)) {
  
  try {
    console.log('Initializing Supabase client with valid credentials');
    supabase = createClient(supabaseUrl, supabaseKey, {
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
      const payload = JSON.parse(atob(supabaseKey.split('.')[1]));
      console.log(`Using Supabase ${payload.role} key for project ref: ${payload.ref}`);
      
      if (payload.role === 'service_role') {
        console.log('Service role key detected - using elevated privileges for build');
      }
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

// Explicitly mark as server-side only
const prerender = false;

// Use uppercase POST instead of lowercase post
async function POST({ request }) {
  try {
    // Parse the request body to get credentials
    const data = await request.json();
    const { email, password } = data;
    
    // Validate inputs
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Email and password are required'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }
    
    // Check if Supabase is initialized
    if (!supabase) {
      console.error('Supabase client not initialized');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Authentication service is not available'
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }
    
    // Attempt to sign in with Supabase
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Authentication error:', error);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message || 'Authentication failed'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }
    
    // If login successful, return success response with session
    return new Response(
      JSON.stringify({
        success: true,
        user: authData.user,
        message: 'Authentication successful'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Set-Cookie': `supabase-auth-token=${authData.session.access_token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`
        }
      }
    );
  } catch (error) {
    console.error('Error processing login request:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'An error occurred during authentication'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  }
}

// Add OPTIONS handler for CORS preflight requests
function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

const login = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  OPTIONS,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

export { login as l, supabase as s };
