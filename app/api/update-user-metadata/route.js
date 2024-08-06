// app/api/update-user-metadata/route.js
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    await clerkClient.users.updateUserMetadata(userId, {
      unsafeMetadata: {
        searchLimits: {
          maxResults: 50, // Max results for signed-in users
          maxKeywords: 5  // Max keywords for signed-in users
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return NextResponse.json({ error: 'Error updating user metadata', details: error.message }, { status: 500 });
  }
}
