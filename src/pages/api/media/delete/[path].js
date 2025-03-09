import { deleteMedia } from '../../../../utils/storage';

// For static site builds, we need to define all possible paths
export function getStaticPaths() {
  return [
    // This is a placeholder path for static site generation
    { params: { path: 'placeholder' } }
  ];
}

export async function del({ params }) {
  try {
    const { path } = params;
    
    // Skip operation for placeholder during build
    if (path === 'placeholder') {
      return new Response(JSON.stringify({ message: 'Static API endpoint' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Delete media
    await deleteMedia(decodeURIComponent(path));
    
    return new Response(JSON.stringify({ 
      message: `Media deleted successfully`
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