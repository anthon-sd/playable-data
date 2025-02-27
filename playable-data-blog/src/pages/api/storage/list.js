import { listContent } from '../../../utils/storage';

export async function get({ request }) {
  try {
    // List all content in storage
    const items = await listContent();
    
    return new Response(JSON.stringify({ 
      items
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