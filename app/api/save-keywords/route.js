// app/api/save-keywords/route.js
import clientPromise from '../../lib/mongodb';
import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    const auth = getAuth(request);
    const { userId } = auth;
    const { keywords } = await request.json();

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid or missing keywords' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('myDatabase');
    const collection = db.collection('userKeywords');

    await collection.updateOne(
      { userId },
      { $addToSet: { keywords: { $each: keywords } } }, // Append keywords without duplicates
      { upsert: true } // Create the document if it doesn't exist
    );

    return new Response(JSON.stringify({ message: 'Keywords saved successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: 'Error processing request', details: error.message }), { status: 500 });
  }
}
