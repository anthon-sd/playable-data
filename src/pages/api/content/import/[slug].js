import { importContentFileToDatabase } from '../../../../utils/content-bridge';

// For static site builds, we need to define all possible paths
export function getStaticPaths() {
  return [
    // This is a placeholder path for static site generation
    { params: { slug: 'placeholder' } }
  ];
}

export async function POST({ params }) {
  try {
    const { slug } = params;
    
    // Skip operation for placeholder during build
    if (slug === 'placeholder') {
      return new Response(JSON.stringify({ message: 'Static API endpoint' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
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