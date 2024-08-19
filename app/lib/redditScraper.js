const puppeteer = require('puppeteer');

async function scrapeRedditComments(keywords) {
    console.log("Starting Reddit Comment Scraper...");

    const browser = await puppeteer.launch({
        headless: false, // Set to false for debugging
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    const comments = [];

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36');

    try {
        for (const keyword of keywords) {
            console.log(`Navigating to Reddit Search URL with Keyword '${keyword}'...`);
            const url = `https://new.reddit.com/search/?q=${keyword}&type=comment&sort=new`;
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 50000 });

            console.log("Waiting for the body element to be present...");
            await page.waitForSelector('body', { timeout: 60000 });

            console.log("Scrolling down to load more comments...");
            for (let i = 0; i < 1; i++) { // Adjust range as needed
                console.log(`Scrolling Down ${i + 1}/2...`);
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            }

            const extractedComments = await page.evaluate((keywords) => {
                const comments = [];
                document.querySelectorAll('span[id^="comment-content-"]').forEach(commentElement => {
                    const commentText = commentElement.textContent.trim().toLowerCase();

                    if (keywords.some(keyword => commentText.includes(keyword.toLowerCase()))) {
                        const timeago = commentElement.closest('div').querySelector('faceplate-timeago time');
                        const timestamp = timeago ? timeago.getAttribute('datetime') : "Timestamp not found";

                        const usernameElement = commentElement.closest('div').querySelector('a.text-neutral-content-strong');
                        const username = usernameElement ? usernameElement.textContent.trim() : "Username not found";

                        // Find comment link
                        const threadLinkElement = commentElement.closest('div').querySelector('faceplate-tracker a[href*="/r/"]');
                        const goToThreadLink = threadLinkElement ? `https://www.reddit.com${threadLinkElement.getAttribute('href')}` : "Link not found";

                        // Extract subreddit from the link
                        const subredditMatch = goToThreadLink.match(/\/r\/([^/]+)/);
                        const subreddit = subredditMatch ? subredditMatch[1] : "Subreddit not found";

                        comments.push({
                            User: `u/${username}`,
                            Subreddit: `r/${subreddit}`,
                            Timestamp: timestamp,
                            Comment: commentText.slice(0, 300) + "...", // Truncate comment to 200 characters
                            Link: goToThreadLink
                        });
                    }
                });
                return comments;
            }, keywords);

            comments.push(...extractedComments);
        }
    } catch (error) {
        console.error('Error scraping comments:', error);
        return { error: error.message };
    } finally {
        await browser.close();
    }

    // Format timestamps
    const formattedComments = comments.map(comment => ({
        ...comment,
        Timestamp: formatTimestamp(comment.Timestamp)
    }));

    console.log(formattedComments);
    return formattedComments;
}

function formatTimestamp(timestamp) {
    if (timestamp === "Timestamp not found") return timestamp;

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid Date";

    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year} ${hours}:${minutes}`;
}

module.exports = { scrapeRedditComments };