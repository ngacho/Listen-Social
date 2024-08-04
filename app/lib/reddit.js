import fetch from 'node-fetch'; // Ensure you have this package installed

export async function fetchRedditPosts(keywords) {
  const baseUrl = 'https://www.reddit.com/search.json?q=';

  try {
    const responses = await Promise.all(keywords.map(keyword => 
      fetch(`${baseUrl}${encodeURIComponent(keyword)}`)
    ));
    
    // Check for non-OK responses
    for (const response of responses) {
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Fetch error: ${response.status} - ${errorBody}`);
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }
    }

    const data = await Promise.all(responses.map(response => response.json()));

    console.log('Reddit API Data:', data); // Log the whole data structure

    return data.flatMap(item => item.data.children.map(child => child.data));
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    throw new Error('Failed to fetch posts');
  }
}
