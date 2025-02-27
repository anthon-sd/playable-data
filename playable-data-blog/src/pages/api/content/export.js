import { exportDatabaseToContent } from '../../../utils/content-bridge';

export async function post({ request }) {
  try {
    // Export all database articles to content files
    const results = await exportDatabaseToContent();
    
    return new Response(JSON.stringify({ 
      message: 'Database exported to content files successfully',
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