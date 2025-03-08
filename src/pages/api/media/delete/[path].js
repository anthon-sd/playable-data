import { deleteMedia } from '../../../../utils/storage';

export async function del({ params }) {
  try {
    const { path } = params;
    
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