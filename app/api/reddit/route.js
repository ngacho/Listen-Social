// app/api/keywords/route.js
import fetch from 'node-fetch';

export async function POST(request) {
  try {
    const { keywords } = await request.json();
    
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid or missing keywords' }), { status: 400 });
    }

    // Assuming you want to search in a specific subreddit
    const subreddit = 'learnprogramming'; // Replace with dynamic value if needed
    const query = keywords.join(' '); // Combine keywords into a single query

    const url = new URL(`https://www.reddit.com/r/${subreddit}/search.json`);
    const params = {
      q: query,
      sort: 'new', // or 'relevance', 'hot', 'top', 'comments'
      limit: 5 // Adjust as needed
    };

    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Reddit API responded with status ${response.status}`);
    }

    const data = await response.json();

    // Process the Reddit data into a format suitable for your front-end
    const processedResults = data.data.children.map(child => ({
      keyword: keywords.join(', '), // Example: Display the joined keywords
      result: child.data.title // Example: Display the post title
    }));

    return new Response(JSON.stringify(processedResults), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return new Response(JSON.stringify({ error: 'Error fetching Reddit posts' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
