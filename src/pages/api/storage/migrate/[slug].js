import { getArticleById } from '../../../../utils/supabase';
import { uploadContent, articleToStorageFormat } from '../../../../utils/storage';

// For static site builds, we need to define all possible paths
export function getStaticPaths() {
  return [
    // This is a placeholder path for static site generation
    { params: { slug: 'placeholder' } }
  ];
}

export async function post({ params }) {
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