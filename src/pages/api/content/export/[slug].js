import { exportDatabaseArticleToContent } from '../../../../utils/content-bridge';

export async function post({ params }) {
  try {
    const { slug } = params;
    
    // Export the specific database article to a content file
    const result = await exportDatabaseArticleToContent(slug);
    
    return new Response(JSON.stringify({ 
      message: `Article "${slug}" exported successfully`,
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