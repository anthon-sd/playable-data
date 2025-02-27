import { initializeStorage } from '../../../utils/storage';

export async function post({ request }) {
  try {
    // Initialize storage buckets
    const result = await initializeStorage();
    
    return new Response(JSON.stringify({ 
      message: 'Storage initialized successfully',
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