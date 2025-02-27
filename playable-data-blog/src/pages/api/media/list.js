import { listMedia } from '../../../utils/storage';

export async function get({ request, url }) {
  try {
    // Get folder from query params
    const folder = url.searchParams.get('folder') || '';
    
    // List media in folder
    const media = await listMedia(folder);
    
    return new Response(JSON.stringify({ 
      media
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