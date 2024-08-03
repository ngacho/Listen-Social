// app/api/callback/route.js
export async function GET(req) {
    try {
      // Handle Reddit OAuth callback logic here
      return new Response(JSON.stringify({ message: 'Callback handled' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  