import { supabase } from '../../../db/supabase';

export async function post({ request }) {
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
            'Content-Type': 'application/json'
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
            'Content-Type': 'application/json'
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
            'Content-Type': 'application/json'
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
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 