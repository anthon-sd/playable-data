import { supabase } from '../../db/supabase';

export async function post({ request }) {
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
          message: 'Service temporarily unavailable'
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json'
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
              'Content-Type': 'application/json'
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
            'Content-Type': 'application/json'
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
          'Content-Type': 'application/json'
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
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 