import { uploadMedia } from '../../../utils/storage';

export async function post({ request }) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || '';
    const altText = formData.get('alt-text') || '';
    
    // Validate file
    if (!file) {
      return new Response(JSON.stringify({ message: 'No file provided' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Upload media
    const result = await uploadMedia(file, folder, { altText });
    
    return new Response(JSON.stringify({ 
      message: 'File uploaded successfully',
      file: result
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