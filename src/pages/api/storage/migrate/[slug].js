import { getArticleById } from '../../../../utils/supabase';
import { uploadContent, articleToStorageFormat } from '../../../../utils/storage';

export async function post({ params }) {
  try {
    const { slug } = params;
    
    // Try to get article from database
    try {
      const article = await getArticleById(slug);
      
      if (article) {
        // Convert to storage format
        const storageFormat = articleToStorageFormat(article);
        
        // Upload to storage
        await uploadContent(article.slug, article.content, storageFormat.metadata);
        
        return new Response(JSON.stringify({ 
          message: `Article "${slug}" migrated successfully from database`,
          source: 'database'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (dbError) {
      console.log('Article not found in database');
      return new Response(JSON.stringify({ 
        message: `Article "${slug}" not found in database`
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // If we get here, the article wasn't found
    return new Response(JSON.stringify({ 
      message: `Article "${slug}" not found`
    }), {
      status: 404,
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