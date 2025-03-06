export async function get({ request }) {
  return new Response(JSON.stringify({ message: 'Static API endpoint' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function post({ request }) {
  return new Response(JSON.stringify({ message: 'Static API endpoint' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}