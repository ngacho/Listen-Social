// src/app/api/search-results/route.js
import clientPromise from '../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('myDatabase');
    const results = await db.collection('dailySearchResults').find({}).toArray();
    
    return new Response(JSON.stringify(results), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error fetching search results:', error);
    return new Response('Error fetching search results', { status: 500 });
  }
}
