import fetch from 'node-fetch';

async function getAccessToken() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
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
    console.error('Access Token Error Response:', errorBody); // Log the response text
    throw new Error(`Failed to get access token: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchRedditPosts(keywords) {
  const accessToken = await getAccessToken();
  const subreddit = 'learnprogramming';
  const query = keywords.join(' ');

  const url = new URL(`https://oauth.reddit.com/r/${subreddit}/search.json`);
  const params = {
    q: query,
    sort: 'new',
    limit: 50
  };

  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'listen-social/0.1.0',
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Reddit Posts Error Response:', errorBody); // Log the response text
    throw new Error(`Failed to fetch Reddit posts: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  return data;
}

export async function POST(request) {
  try {
    const { keywords } = await request.json();

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid or missing keywords' }), { status: 400 });
    }

    const data = await fetchRedditPosts(keywords);
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return new Response(JSON.stringify({ error: 'Error fetching Reddit posts', details: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
