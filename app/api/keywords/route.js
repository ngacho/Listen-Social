import fetch from 'node-fetch';

export async function POST(request) {
  try {
    // Check for application/json content type
    if (request.headers.get('Content-Type') !== 'application/json') {
      return new Response(JSON.stringify({ error: 'Invalid content type' }), { status: 415 });
    }

    const { keywords, subreddit } = await request.json();
    
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid or missing keywords' }), { status: 400 });
    }

    // Validate subreddit or use a default one
    const subredditName = subreddit || 'learnprogramming'; // Default subreddit if not provided
    const query = keywords.join(' '); // Combine keywords into a single query

    const url = new URL(`https://www.reddit.com/r/${subredditName}/search.json`);
    const params = {
      q: query,
      sort: 'new', // or 'relevance', 'hot', 'top', 'comments'
      limit: 50
    };

    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Reddit API responded with status ${response.status}`);
    }

    const data = await response.json();

    // Process the data if needed and return a structured response
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error fetching Reddit posts:', error.message);
    return new Response(JSON.stringify({ error: 'Error fetching Reddit posts' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
