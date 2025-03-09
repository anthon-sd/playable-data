// Moved from api/content/export.js to avoid file naming conflicts during build
export async function POST({ request }) {
  return new Response(JSON.stringify({ message: 'Static API endpoint' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
} 