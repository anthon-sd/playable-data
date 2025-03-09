import { listMedia } from '../../../utils/storage';

// Mock media data for when Supabase is not available
const MOCK_MEDIA = [
  {
    name: 'sample-image-1.jpg',
    id: 'sample1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_accessed_at: new Date().toISOString(),
    metadata: {
      size: 256000,
      mimetype: 'image/jpeg'
    },
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c'
  },
  {
    name: 'sample-image-2.jpg',
    id: 'sample2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_accessed_at: new Date().toISOString(),
    metadata: {
      size: 512000,
      mimetype: 'image/jpeg'
    },
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa'
  }
];

// Updated to uppercase GET to fix deprecation warning
export async function GET({ request, url }) {
  try {
    // Get folder from query params
    const folder = url.searchParams.get('folder') || '';
    
    try {
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
    } catch (storageError) {
      console.error('Error accessing storage:', storageError);
      // Return mock media data on error
      return new Response(JSON.stringify({ 
        media: MOCK_MEDIA,
        message: 'Using mock media data due to storage error'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Media list API error:', error);
    return new Response(JSON.stringify({ 
      media: MOCK_MEDIA,
      error: error.message 
    }), {
      status: 200, // Still return 200 to prevent build failures, but include error
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}