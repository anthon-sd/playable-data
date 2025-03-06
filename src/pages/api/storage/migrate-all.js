import { getArticles } from '../../../utils/supabase';
import { migrateContentToStorage } from '../../../utils/storage';

export async function post({ request }) {
  try {
    // Get all content from database
    const dbArticles = await getArticles();
    
    // Track results
    let results = [];
    
    // Migrate database articles
    if (dbArticles.length > 0) {
      results = await migrateContentToStorage(dbArticles);
    }
    
    return new Response(JSON.stringify({ 
      message: 'Content migration completed',
      results
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