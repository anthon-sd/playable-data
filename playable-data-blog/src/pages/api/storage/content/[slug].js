import { getContent, deleteContent } from '../../../../utils/storage';

export async function get({ params }) {
  try {
    const { slug } = params;
    
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

export async function del({ params }) {
  try {
    const { slug } = params;
    
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