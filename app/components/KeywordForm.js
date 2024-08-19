import { useState, useCallback } from 'react';
import { RefreshIcon, SearchIcon, ExternalLinkIcon, XCircleIcon } from '@heroicons/react/solid';
import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from "framer-motion";

function KeywordForm() {
  const [inputKeywords, setInputKeywords] = useState('');
  const [isPhraseMatching, setIsPhraseMatching] = useState(false);
  const [results, setResults] = useState([]);
  const [commentsResults, setCommentsResults] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null); // New state for selected comment
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState('new');
  const [timeFilter, setTimeFilter] = useState('all');
  const [resultLimit, setResultLimit] = useState(10);
  const [restrictSr, setRestrictSr] = useState(false);
  const [subreddit, setSubreddit] = useState('');
  const [includeFacets, setIncludeFacets] = useState(false);
  const [type, setType] = useState([]);
  const { user, isSignedIn } = useUser();
  const [checkComments, setCheckComments] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const fetchResults = useCallback(async (action = 'search', finalKeywords, checkComments) => {
    if (!finalKeywords && action === 'search') return;
  
    if (action === 'search') setIsSearching(true);
    if (action === 'refresh') setIsRefreshing(true);
  
    try {
      await fetch('/api/save-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: finalKeywords, userId: user?.id }),
      });
  
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: finalKeywords,
          sortBy,
          timeFilter,
          resultLimit,
          restrictSr,
          subreddit,
          includeFacets,
          type,
          checkComments,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log('API Response:', data);
  
      const processedResults = data.data.children.map(child => ({
        keyword: isPhraseMatching ? finalKeywords[0].replace(/"/g, '') : finalKeywords.join(', '),
        title: child.data.title,
        selftext: child.data.selftext,
        author: child.data.author,
        subreddit: child.data.subreddit,
        url: `https://www.reddit.com${child.data.permalink}`,
      }));
  
      setResults(processedResults);
  
      if (checkComments) {
        const commentsData = data.comments || [];
        const processedComments = commentsData.map(comment => ({
          author: comment.User,
          body: comment.Comment,
          subreddit: comment.Subreddit,
          timestamp: comment.Timestamp,
          link: comment.Link
        }));
        setCommentsResults(processedComments);
      }

    } catch (error) {
      console.error('Error fetching results:', error);
      setResults([]);
      setCommentsResults([]);
    } finally {
      if (action === 'search') setIsSearching(false);
      if (action === 'refresh') setIsRefreshing(false);
    }
  }, [sortBy, timeFilter, resultLimit, restrictSr, subreddit, includeFacets, type, user?.id, checkComments]);
  

  const handleSubmit = (event) => {
    event.preventDefault();
    const keywords = inputKeywords.split(',').map(keyword => keyword.trim());
    const finalKeywords = isPhraseMatching ? [`"${keywords.join(' ')}"`] : keywords;
    fetchResults('search', finalKeywords, checkComments);
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    fetchResults('refresh');
  };

  const handleTextClick = (data) => setSelectedText(data);
  const handleCommentClick = (comment) => setSelectedComment(comment); // Function to handle comment click
  const closeModal = () => {
    setSelectedText(null);
    setSelectedComment(null); // Close comment modal as well
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-800 to-gray-900 transition-colors duration-300 ease-in">
      <div className="flex flex-1 transition-all duration-300 ease-in">
        <div className="w-full lg:w-1/3 p-6 flex justify-center items-center">
        <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.005, boxShadow: "0px 0px 15px rgba(29, 78, 216, 0.4)" }}
  whileFocus={{ scale: 1.005, boxShadow: "0px 0px 15px rgba(29, 78, 216, 0.4)" }}
  className="bg-gray-900 p-8 rounded-3xl shadow-lg hover:shadow-xl border border-gray-700 w-full max-w-md transition-all duration-300 ease-in-out"
>
  <h1 className="text-4xl font-extrabold mb-6 text-gray-100 text-center">
    Keyword Search <span className="text-blue-400">(Reddit)</span>
  </h1>
  <form onSubmit={handleSubmit} className="space-y-6">
    <motion.input
      whileFocus={{ scale: 1.02, boxShadow: "0px 0px 15px rgba(29, 78, 216, 0.6)" }}
      type="text"
      placeholder="Enter keywords separated by commas"
      value={inputKeywords}
      onChange={(e) => setInputKeywords(e.target.value)}
      required
      className="border border-gray-600 bg-gray-700 p-4 rounded-lg w-full text-gray-200 placeholder-gray-400 focus:outline-none  transition-colors duration-300 ease-in"
    />
              <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="relative flex-1">
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    disabled={!isSignedIn}
                    className={`border border-gray-600 bg-gray-700 p-4 pr-12 rounded-lg w-full text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ease-in ${!isSignedIn ? 'bg-gray-600 cursor-not-allowed' : ''}`}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="hot">Hot</option>
                    <option value="top">Top</option>
                    <option value="new">New</option>
                    <option value="comments">Comments</option>
                  </motion.select>
                  {!isSignedIn && <span className="absolute inset-y-0 right-4 flex items-center text-gray-400" title="This feature is only available to signed-in users.">🔒</span>}
                </div>
                <div className="relative flex-1">
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    disabled={!isSignedIn}
                    className={`border border-gray-600 bg-gray-700 p-4 pr-12 rounded-lg w-full text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ease-in ${!isSignedIn ? 'bg-gray-600 cursor-not-allowed' : ''}`}
                  >
                    <option value="hour">Past Hour</option>
                    <option value="day">Past Day</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                    <option value="year">Past Year</option>
                    <option value="all">All Time</option>
                  </motion.select>
                  {!isSignedIn && <span className="absolute inset-y-0 right-4 flex items-center text-gray-400" title="This feature is only available to signed-in users.">🔒</span>}
                </div>
                <div className="relative flex-1">
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="number"
                    min="1"
                    max="100"
                    value={resultLimit}
                    onChange={(e) => setResultLimit(e.target.value)}
                    disabled={!isSignedIn}
                    className={`border border-gray-600 bg-gray-700 p-4 pr-12 rounded-lg w-full text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ease-in ${!isSignedIn ? 'bg-gray-600 cursor-not-allowed' : ''}`}
                  />
                  {!isSignedIn && <span className="absolute inset-y-0 right-4 flex items-center text-gray-400" title="This feature is only available to signed-in users.">🔒</span>}
                </div>
              </div>
              <div className="relative flex-1">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  placeholder="Restrict to this subreddit"
                  value={subreddit}
                  onChange={(e) => setSubreddit(e.target.value)}
                  disabled={!isSignedIn}
                  className={`border border-gray-600 bg-gray-700 p-4 rounded-lg w-full text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ease-in ${!isSignedIn ? 'bg-gray-600 cursor-not-allowed' : ''}`}
                />
                {!isSignedIn && <span className="absolute inset-y-0 right-4 flex items-center text-gray-400" title="This feature is only available to signed-in users.">🔒</span>}
              </div>
              
              <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="checkbox"
                    checked={restrictSr}
                    onChange={(e) => setRestrictSr(e.target.checked)}
                    disabled={!isSignedIn}
                    className={`h-5 w-5 ${!isSignedIn ? 'cursor-not-allowed opacity-50' : ''}`}
                  />
                  <span className={`text-gray-200 ${!isSignedIn ? 'cursor-not-allowed opacity-50' : ''}`}>Restrict to Subreddit</span>
                </label>

                <label htmlFor="phrase-matching" className="flex items-center space-x-2">
                  <motion.input
                    id="phrase-matching"
                    whileFocus={{ scale: 1.02 }}
                    type="checkbox"
                    checked={isPhraseMatching}
                    onChange={() => setIsPhraseMatching(!isPhraseMatching)}
                    disabled={!isSignedIn}
                    className={`h-5 w-5 ${!isSignedIn ? 'cursor-not-allowed opacity-50' : ''}`}
                  />
                  <span className={`text-gray-200 ${!isSignedIn ? 'cursor-not-allowed opacity-50' : ''}`}>Exact Phrase Match</span>
                </label>

                <label htmlFor="check-comments" className="flex items-center space-x-2">
    <motion.input
      id="check-comments"
      whileFocus={{ scale: 1.02 }}
      type="checkbox"
      checked={checkComments}
      onChange={() => setCheckComments(!checkComments)}
      disabled={!isSignedIn}
      className={`h-5 w-5 ${!isSignedIn ? 'cursor-not-allowed opacity-50' : ''}`}
    />
    <span className={`text-gray-200 ${!isSignedIn ? 'cursor-not-allowed opacity-50' : ''}`}>
      Check Comments too
    </span>
  </label>


              </div>
              

              


              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
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
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
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
                </motion.button>
              </div>
              
            </form>
          </motion.div>
        </div>

        <div className="w-full lg:w-2/3 p-6 flex flex-col">
  

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.002, boxShadow: "0px 0px 15px rgba(29, 78, 216, 0.3)" }}
    whileFocus={{ scale: 1.002, boxShadow: "0px 0px 15px rgba(29, 78, 216, 0.3)" }}
    className="bg-gray-890 p-8 rounded-2xl shadow-lg border border-gray-700 flex-1 transition-all duration-300 ease-in-out"
  >
{/* Header for tab toggling */}
<div className="flex items-center mb-6">
  <button
    onClick={() => setActiveTab('posts')}
    className={`py-2 px-4 rounded-t-lg transition-all duration-300 ease-in-out ${
      activeTab === 'posts'
        ? 'bg-gray-700 border-b-4 border-blue-500 text-gray-200'
        : 'bg-gray-800 border-b-2 border-transparent text-gray-400 hover:bg-gray-600'
    }`}
    style={{ boxShadow: activeTab === 'posts' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none' }}
  >
    Posts
  </button>
  <button
    onClick={() => setActiveTab('comments')}
    className={`py-2 px-4 rounded-t-lg transition-all duration-300 ease-in-out ${
      activeTab === 'comments'
        ? 'bg-gray-700 border-b-4 border-blue-500 text-gray-200'
        : 'bg-gray-800 border-b-2 border-transparent text-gray-400 hover:bg-gray-600'
    }`}
    style={{ boxShadow: activeTab === 'comments' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none' }}
  >
    Comments
  </button>
</div>


    <div className="overflow-x-auto">
      <div className="overflow-y-auto max-h-[calc(100vh-12rem)]"> {/* Adjusted max height */}
        {activeTab === 'posts' && (
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Keyword</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Text (Click)</th>
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
                      className="px-6 py-4 text-sm text-gray-200 cursor-pointer hover:bg-blue-600 hover:bg-opacity-10 transition-colors duration-300 ease-in"
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
  {result.author ? `u/${result.author}` : "N/A"}
</td>
<td className="px-6 py-4 text-sm text-gray-200">
  {result.subreddit ? `r/${result.subreddit}` : "N/A"}
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
        )}
       {activeTab === 'comments' && (
  <table className="min-w-full divide-y divide-gray-700">
    <thead className="bg-gray-700">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Comment</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Subreddit</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Link</th>
      </tr>
    </thead>
    <tbody className="bg-gray-800 divide-y divide-gray-700">
      {commentsResults.length > 0 ? (
        commentsResults.map((comment, index) => (
          <tr key={index}>
            <td className="px-6 py-4 text-sm text-gray-200">{comment.author || "N/A"}</td>
            <td className="px-6 py-4 text-sm text-gray-200">
              <div 
                className="max-w-xs h-12 overflow-hidden text-ellipsis cursor-pointer" 
                onClick={() => handleCommentClick(comment)} // Handle click here
              >
                {comment.body || "N/A"}
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-200">{comment.subreddit || "N/A"}</td>
            <td className="px-6 py-4 text-sm text-gray-200">{comment.timestamp || "N/A"}</td>
            <td className="px-6 py-4 text-sm text-gray-200">
              {comment.link ? (
                <a href={comment.link} 
                  className="text-blue-400 hover:underline flex items-center"
                  target="_blank" 
                  rel="noopener noreferrer">
                  <ExternalLinkIcon className="w-5 h-5" />
                </a>
              ) : (
                <span>N/A</span>
              )}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="5" className="px-6 py-4 text-sm text-gray-200 text-center">No comments found</td>
        </tr>
      )}
    </tbody>
  </table>
)}

      </div>
    </div>
  </motion.div>
</div>

      </div>
  
      <AnimatePresence mode="wait">
  {selectedText && (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    >
      <motion.div className="bg-gray-800 p-8 rounded-lg w-full max-w-4xl relative max-h-[90vh] overflow-auto">
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
      </motion.div>
    </motion.div>
  )}

  {selectedComment && (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    >
      <motion.div className="bg-gray-800 p-8 rounded-lg w-full max-w-4xl relative max-h-[90vh] overflow-auto">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <XCircleIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-200">Comment Details</h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-300">Author:</h3>
              <p className="text-gray-200">
                {selectedComment.author ? (
                  <a
                    href={`https://www.reddit.com/user/${selectedComment.author}`}
                    className="text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedComment.author}
                  </a>
                ) : "N/A"}
              </p>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-300">Subreddit:</h3>
              <p className="text-gray-200">
                {selectedComment.subreddit ? (
                  <a
                    href={`https://www.reddit.com/r/${selectedComment.subreddit}`}
                    className="text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedComment.subreddit}
                  </a>
                ) : "N/A"}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-300">Comment:</h3>
            <p className="text-gray-200 whitespace-pre-wrap">
              {selectedComment.body || "N/A"}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-300">Link:</h3>
            <a
              href={selectedComment.link}
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Comment
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>



     
    </div>
  );
}

export default KeywordForm;