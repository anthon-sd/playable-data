// For static site builds, we need to define all possible paths
export function getStaticPaths() {
  return [
    // This is a placeholder path for static site generation
    // In a production environment, you would generate paths for all articles
    { params: { id: 'placeholder' } }
  ];
}

// Renaming lowercase functions to uppercase as recommended by Astro
export async function GET({ params }) {
  return new Response(JSON.stringify({ message: 'Static API endpoint' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function PUT({ request, params }) {
  return new Response(JSON.stringify({ message: 'Static API endpoint' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function DELETE({ params }) {
  return new Response(JSON.stringify({ message: 'Static API endpoint' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}