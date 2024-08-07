import { useState, useCallback } from 'react';
import usePolling from './usePolling'; // Adjust the path as necessary
import { RefreshIcon, SearchIcon } from '@heroicons/react/solid'; // Import icons
import { XCircleIcon } from '@heroicons/react/solid'; // Import close icon
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { ExternalLinkIcon } from '@heroicons/react/solid';

function KeywordForm() {
  const [inputKeywords, setInputKeywords] = useState('');
  const [results, setResults] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [timeFilter, setTimeFilter] = useState('all');
  const [resultLimit, setResultLimit] = useState(10);
  const [restrictSr, setRestrictSr] = useState(false);
  const [subreddit, setSubreddit] = useState(''); // Changed from category
  const [includeFacets, setIncludeFacets] = useState(false);
  const [type, setType] = useState([]);
  const { user, isSignedIn } = useUser();

  const fetchResults = useCallback(async (action = 'search') => {
  if (!inputKeywords && action === 'search') return;

  if (action === 'search') setIsSearching(true);
  if (action === 'refresh') setIsRefreshing(true);

  try {
    // Save keywords to the server
    await fetch('/api/save-keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keywords: inputKeywords.split(',').map(keyword => keyword.trim()),
        userId: user?.id, // Assuming userId is available from useUser()
      }),
    });

    // Fetch results from Reddit
    const response = await fetch('/api/keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keywords: inputKeywords.split(',').map(keyword => keyword.trim()),
        sortBy,
        timeFilter,
        resultLimit,
        restrictSr,
        subreddit,
        includeFacets,
        type,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('API Response:', data);

    const processedResults = data.data.children.map(child => ({
      keyword: inputKeywords.split(',').map(keyword => keyword.trim()).join(', '),
      title: child.data.title,
      selftext: child.data.selftext,
      author: child.data.author,
      subreddit: child.data.subreddit,
      url: `https://www.reddit.com${child.data.permalink}`,
    }));

    setResults(processedResults);
  } catch (error) {
    console.error('Error fetching results:', error);
    setResults([]);
  } finally {
    if (action === 'search') setIsSearching(false);
    if (action === 'refresh') setIsRefreshing(false);
  }
}, [inputKeywords, sortBy, timeFilter, resultLimit, restrictSr, subreddit, includeFacets, type, user?.id]);


  usePolling(fetchResults, 86400000); // Poll every 24 hours

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchResults('search');
  };

  const handleRefresh = async () => {
    if (isRefreshing) return; // Prevent multiple refreshes
    fetchResults('refresh');
  };

  

  const handleTextClick = (data) => {
    setSelectedText(data);
  };

  const closeModal = () => {
    setSelectedText(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 transition-colors duration-300 ease-in">
      <div className="flex flex-1 transition-all duration-300 ease-in">
        <div className="w-full lg:w-1/3 p-6 flex justify-center items-center">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700 w-full max-w-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-200 text-center">Keyword Search</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
  <input
    type="text"
    placeholder="Enter keywords separated by commas"
    value={inputKeywords}
    onChange={(e) => setInputKeywords(e.target.value)}
    required
    className="border border-gray-600 bg-gray-700 p-4 rounded-lg w-full text-gray-200 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-400 focus:border-blue-400 transition-colors duration-300 ease-in"
  />
  <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
    <div className="relative flex-1">
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        disabled={!isSignedIn}
        className={`border border-gray-600 bg-gray-700 p-4 pr-12 rounded-lg w-full text-gray-200 focus:outline-none focus:ring focus:ring-blue-400 focus:border-blue-400 transition-colors duration-300 ease-in ${!isSignedIn ? 'bg-gray-600 cursor-not-allowed' : ''}`}
      >
        <option value="relevance">Relevance</option>
        <option value="hot">Hot</option>
        <option value="top">Top</option>
        <option value="new">New</option>
        <option value="comments">Comments</option>
      </select>
      {!isSignedIn && <span className="absolute inset-y-0 right-4 flex items-center text-gray-400" title="This feature is only available to signed-in users.">🔒</span>}
    </div>
    <div className="relative flex-1">
      <select
        value={timeFilter}
        onChange={(e) => setTimeFilter(e.target.value)}
        disabled={!isSignedIn}
        className={`border border-gray-600 bg-gray-700 p-4 pr-12 rounded-lg w-full text-gray-200 focus:outline-none focus:ring focus:ring-blue-400 focus:border-blue-400 transition-colors duration-300 ease-in ${!isSignedIn ? 'bg-gray-600 cursor-not-allowed' : ''}`}
      >
        <option value="hour">Past Hour</option>
        <option value="day">Past Day</option>
        <option value="week">Past Week</option>
        <option value="month">Past Month</option>
        <option value="year">Past Year</option>
        <option value="all">All Time</option>
      </select>
      {!isSignedIn && <span className="absolute inset-y-0 right-4 flex items-center text-gray-400" title="This feature is only available to signed-in users.">🔒</span>}
    </div>
    <div className="relative flex-1">
      <input
        type="number"
        min="1"
        max="100"
        value={resultLimit}
        onChange={(e) => setResultLimit(e.target.value)}
        disabled={!isSignedIn}
        className={`border border-gray-600 bg-gray-700 p-4 pr-12 rounded-lg w-full text-gray-200 focus:outline-none focus:ring focus:ring-blue-400 focus:border-blue-400 transition-colors duration-300 ease-in ${!isSignedIn ? 'bg-gray-600 cursor-not-allowed' : ''}`}
      />
      {!isSignedIn && <span className="absolute inset-y-0 right-4 flex items-center text-gray-400" title="This feature is only available to signed-in users.">🔒</span>}
    </div>
  </div>
  <div className="relative flex-1">
    <input
      type="text"
      placeholder="Restrict to this subreddit"
      value={subreddit}
      onChange={(e) => setSubreddit(e.target.value)}
      disabled={!isSignedIn}
      className={`border border-gray-600 bg-gray-700 p-4 rounded-lg w-full text-gray-200 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-400 focus:border-blue-400 transition-colors duration-300 ease-in ${!isSignedIn ? 'bg-gray-600 cursor-not-allowed' : ''}`}
    />
    {!isSignedIn && <span className="absolute inset-y-0 right-4 flex items-center text-gray-400" title="This feature is only available to signed-in users.">🔒</span>}
  </div>
  <label className="flex items-center space-x-2">
    <input
      type="checkbox"
      checked={restrictSr}
      onChange={(e) => setRestrictSr(e.target.checked)}
      disabled={!isSignedIn}
      className={`h-5 w-5 ${!isSignedIn ? 'cursor-not-allowed opacity-50' : ''}`}
    />
    <span className={`text-gray-200 ${!isSignedIn ? 'cursor-not-allowed opacity-50' : ''}`}>Restrict to Subreddit</span>
  </label>
  <div className="flex space-x-4">
    <button
      type="submit"
      disabled={isSearching || isRefreshing}
      className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 ease-in ${isSearching ? 'bg-blue-500 cursor-not-allowed' : ''}`}
    >
      {isSearching ? (
        <span className="flex items-center justify-center">
          Searching... <SearchIcon className="w-5 h-5 ml-2 animate-spin" />
        </span>
      ) : (
        <span className="flex items-center justify-center">
          Search <SearchIcon className="w-5 h-5 ml-2" />
        </span>
      )}
    </button>
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-300 ease-in ${isRefreshing ? 'bg-gray-500 cursor-not-allowed' : ''}`}
    >
      {isRefreshing ? (
        <span className="flex items-center justify-center">
          Refreshing... <RefreshIcon className="w-5 h-5 ml-2 animate-spin" />
        </span>
      ) : (
        <span className="flex items-center justify-center">
          Refresh <RefreshIcon className="w-5 h-5 ml-2" />
        </span>
      )}
    </button>
  </div>
</form>

          </div>
        </div>

        <div className="w-full lg:w-2/3 p-6 flex flex-col">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700 flex-1">
            <h2 className="text-2xl font-bold mb-6 text-gray-200">Search Results</h2>
            <div className="overflow-x-auto">
              <div className="overflow-y-auto max-h-[calc(100vh-12rem)]"> {/* Adjusted max height */}
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Keyword</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Text (Click</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Subreddit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">URL</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {results.length > 0 ? (
                      results.map((result, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 text-sm text-gray-200">{result.keyword || "N/A"}</td>
                          <td className="px-6 py-4 text-sm text-gray-200">
                            <div className="max-w-xs h-12 overflow-hidden text-ellipsis">
                              {result.title || "N/A"}
                            </div>
                          </td>
                          <td
  className="px-6 py-4 text-sm text-gray-200 cursor-pointer hover:bg-gray-700 transition-colors duration-300 ease-in"
  onClick={() =>
    handleTextClick({
      title: result.title,
      author: result.author,
      url: result.url,
      selftext: result.selftext,
      subreddit: result.subreddit,
    })
  }
>
  <div className="max-w-xs h-20 overflow-hidden text-ellipsis">
    {result.selftext || "N/A"}
  </div>
</td>

                          <td className="px-6 py-4 text-sm text-gray-200">
                            {result.author || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-200">
                            {result.subreddit || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-200">
                            {result.url ? (
                             <a
                             href={result.url}
                             className="text-blue-400 hover:underline flex items-center"
                             target="_blank"
                             rel="noopener noreferrer"
                           >
                             <ExternalLinkIcon className="w-5 h-5" />
                            
                           </a>
                            ) : (
                              "N/A"
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-sm text-gray-200 text-center">
                          No results found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      {selectedText && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-8 rounded-lg w-full max-w-4xl relative max-h-[90vh] overflow-auto">
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        <XCircleIcon className="h-6 w-6" />
      </button>
      <h2 className="text-2xl font-bold mb-4 text-gray-200">Post Details</h2>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:space-x-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-300">Title:</h3>
            <p className="text-gray-200">
              {selectedText.title || "N/A"}
            </p>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-300">Author:</h3>
            <p className="text-gray-200">
              {selectedText.author ? (
                <a
                  href={`https://www.reddit.com/user/${selectedText.author}`}
                  className="text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {selectedText.author}
                </a>
              ) : "N/A"}
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-300">Subreddit:</h3>
          <p className="text-gray-200">
            {selectedText.subreddit ? (
              <a
                href={`https://www.reddit.com/r/${selectedText.subreddit}`}
                className="text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {selectedText.subreddit}
              </a>
            ) : "N/A"}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-300">Text:</h3>
          <p className="text-gray-200 whitespace-pre-wrap">
            {selectedText.selftext || "N/A"}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-300">URL:</h3>
          <a
            href={selectedText.url}
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Post
          </a>
        </div>
      </div>
    </div>
  </div>
)}

     
    </div>
  );
}

export default KeywordForm;