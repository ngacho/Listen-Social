// app/api/redditSearchResults/[userId]/route.js
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET(request, { params }) {
  const { userId } = params;

  try {
    const client = await clientPromise;
    const db = client.db('myDatabase');

    const results = await db.collection('redditSearchResults').find({ userId }).toArray();
    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
