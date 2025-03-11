import { s as supabase } from './login_38b9750c.mjs';

// Explicitly mark as server-side only
const prerender = false;

// Change from lowercase 'post' to uppercase 'POST'
async function POST({ request }) {
  try {
    // Parse the request body to get the email
    const data = await request.json();
    const { email } = data;
    
    // Validate email
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Valid email is required'
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
          message: 'Service temporarily unavailable'
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
    
    // Insert the email into the newsletter_signups table
    const { data: insertData, error } = await supabase
      .from('newsletter_signups')
      .insert([
        { 
          email,
          signup_date: new Date().toISOString(),
          source: data.source || 'website',
          page_url: data.pageUrl || ''
        }
      ]);
    
    if (error) {
      // Check if error is due to duplicate email
      if (error.code === '23505') { // PostgreSQL unique violation code
        return new Response(
          JSON.stringify({
            success: true,
            message: 'You\'re already subscribed to our newsletter!'
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type'
            }
          }
        );
      }
      
      console.error('Error inserting email into Supabase:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'An error occurred while saving your email'
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
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you for subscribing to our newsletter!'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  } catch (error) {
    console.error('Error processing newsletter signup:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'An error occurred while processing your request'
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

export { OPTIONS, POST, prerender };
