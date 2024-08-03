import fetch from 'node-fetch'; // Ensure you have this package installed

export async function fetchRedditPosts(keywords) {
  const baseUrl = 'https://www.reddit.com/search.json?q=';

  try {
    const responses = await Promise.all(keywords.map(keyword => 
      fetch(`${baseUrl}${encodeURIComponent(keyword)}`)
    ));
    const data = await Promise.all(responses.map(response => response.json()));

    return data.flatMap(item => item.data.children.map(child => child.data));
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    throw new Error('Failed to fetch posts');
  }
}
