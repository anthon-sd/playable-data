import { syncContentToDatabase } from '../../../utils/content-bridge';

export async function post({ request }) {
  try {
    // Sync all content files to the database
    const result = await syncContentToDatabase();
    
    return new Response(JSON.stringify({ 
      message: 'Content files synced to database successfully',
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