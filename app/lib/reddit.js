import fetch from 'node-fetch'; // Ensure you have this package installed

export async function fetchRedditPosts({ keywords, resultLimit, timeFilter }) {
  const baseUrl = 'https://www.reddit.com/search.json';
  
  try {
    // Combine keywords into a single query string with OR logic
    const query = keywords.map(keyword => `keyword:${encodeURIComponent(keyword)}`).join(' OR ');
    const url = `${baseUrl}?q=${query}&limit=${resultLimit}&t=${timeFilter}`;
    
    // Fetch Reddit posts
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Fetch error: ${response.status} - ${errorBody}`);
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    const data = await response.json();
    console.log('Reddit API Data:', data); // Log the whole data structure

    // Flatten the posts from Reddit's response
    return data.data.children.map(child => child.data);
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    throw new Error('Failed to fetch posts');
  }
}

export default fetchRedditPosts;
