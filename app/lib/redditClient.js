// app/lib/redditClient.js
import axios from 'axios';

const REDDIT_API_BASE = 'https://www.reddit.com';

export const getRedditPosts = async (keywords) => {
  const query = keywords.join(' ');
  const response = await axios.get(`${REDDIT_API_BASE}/search.json?q=${query}&sort=new`);
  return response.data;
};
