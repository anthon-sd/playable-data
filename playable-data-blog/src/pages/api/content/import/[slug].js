import { importContentFileToDatabase } from '../../../../utils/content-bridge';

export async function post({ params }) {
  try {
    const { slug } = params;
    
    // Import the specific content file to the database
    const result = await importContentFileToDatabase(slug);
    
    return new Response(JSON.stringify({ 
      message: `Article "${slug}" imported successfully`,
      article: result
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