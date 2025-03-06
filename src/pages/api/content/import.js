import { importContentToDatabase } from '../../../utils/content-bridge';

export async function post({ request }) {
  try {
    // Import all content files to the database
    const results = await importContentToDatabase();
    
    return new Response(JSON.stringify({ 
      message: 'Content files imported successfully',
      results
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