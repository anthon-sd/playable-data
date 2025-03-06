import { uploadContent } from '../../../utils/storage';

export async function post({ request }) {
  try {
    // Get request body
    const body = await request.json();
    const { slug, content, metadata } = body;
    
    // Validate required fields
    if (!slug || !content) {
      return new Response(JSON.stringify({ message: 'Slug and content are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Upload content
    const result = await uploadContent(slug, content, metadata);
    
    return new Response(JSON.stringify({ 
      message: 'Content uploaded successfully',
      result
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}