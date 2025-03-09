import { getContent, deleteContent } from '../../../../utils/storage';

// For static site builds, we need to define all possible paths
export function getStaticPaths() {
  return [
    // This is a placeholder path for static site generation
    { params: { slug: 'placeholder' } }
  ];
}

// Updated to uppercase per Astro recommendation
export async function GET({ params }) {
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
    
    // Get content from storage
    const content = await getContent(slug);
    
    return new Response(JSON.stringify(content), {
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

// Updated to uppercase per Astro recommendation
export async function DELETE({ params }) {
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
    
    // Delete content from storage
    await deleteContent(slug);
    
    return new Response(JSON.stringify({ 
      message: `Content "${slug}" deleted successfully`
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