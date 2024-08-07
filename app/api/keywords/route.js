import fetch from 'node-fetch';
import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

// Function to get Reddit access token
async function getAccessToken() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Client ID or Secret is missing');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Access Token Error Response:', errorBody);
    throw new Error(`Failed to get access token: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Function to fetch Reddit posts
async function fetchRedditPosts({ keywords, resultLimit, sortBy, timeFilter, restrictSr, subreddit, includeFacets, type, after }) {
  const accessToken = await getAccessToken();
  const query = keywords.join(' ');

  const url = new URL(`https://oauth.reddit.com/r/${subreddit || 'all'}/search.json`);
  
  const params = {
    q: query,
    sort: sortBy || 'new',
    t: timeFilter || 'all',
    limit: resultLimit ? parseInt(resultLimit, 10) : 10, // Ensure resultLimit is an integer and default to 10
    restrict_sr: restrictSr ? 'true' : 'false', // Convert boolean to string
    include_facets: includeFacets ? 'true' : 'false', // Convert boolean to string
    after: after || undefined // Handle pagination
  };

  if (type && type.length > 0) {
    params.type = type.join(',');
  }

  // Log parameters for debugging
  console.log('Fetching Reddit posts with parameters:', params);

  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'listen-social/0.1.0'
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Reddit Posts Error Response:', errorBody);
    throw new Error(`Failed to fetch Reddit posts: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  return data;
}

// POST handler for /api/keywords
export async function POST(request) {
  try {
    const auth = getAuth(request);
    const { userId } = auth;

    // Parse request body
    const { keywords, sortBy, timeFilter, restrictSr, subreddit, includeFacets, type, resultLimit } = await request.json();

    let finalResultLimit = resultLimit || 10; // Default limit if not provided

    // If user is signed in, fetch their metadata to get limits
    if (userId) {
      try {
        const user = await clerkClient().users.getUser(userId);
        const metadata = user.unsafeMetadata || {};
        finalResultLimit = metadata.searchLimits?.maxResults || resultLimit; // Use user-specific limit or the provided limit
      } catch (error) {
        console.error('Error retrieving user metadata:', error);
      }
    }

    // Validate keywords
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid or missing keywords' }), { status: 400 });
    }

    // Apply keyword limit for guest users
    if (!userId && keywords.length > 3) {
      return new Response(JSON.stringify({ error: 'You can only search with a maximum of 3 keywords' }), { status: 400 });
    }

    // Fetch Reddit posts with the appropriate result limit and filters
    const data = await fetchRedditPosts({
      keywords,
      resultLimit: finalResultLimit,
      sortBy,
      timeFilter,
      restrictSr,
      subreddit,
      includeFacets,
      type
    });

    // Log the response for debugging
    console.log('Reddit posts response:', data);

    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return new Response(JSON.stringify({ error: 'Error fetching Reddit posts', details: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
