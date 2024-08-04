"use client";

import { useState } from 'react';
import DOMPurify from 'dompurify';
import KeywordForm from './components/KeywordForm'; // Adjust the path if necessary
import './globals.css';

export default function RedditKeywordPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async (keywords) => {
    setLoading(true);
    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords }),
      });
      const data = await response.json();
      const fetchedPosts = data.data.children.map(child => child.data);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordsSubmit = (keywords) => {
    fetchPosts(keywords);
  };

  return (
    <div>
      <KeywordForm onSubmit={handleKeywordsSubmit} />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {posts.map(post => (
            <li key={post.id} className="border-b p-4">
              <h2 className="text-xl font-bold">
                <a
                  href={`https://www.reddit.com${post.permalink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {post.title}
                </a>
              </h2>
              <p className="text-gray-600">Posted by u/{post.author} in {post.subreddit}</p>
              <div
                className="mt-2"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.selftext) }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
