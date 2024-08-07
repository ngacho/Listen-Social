import { Suprsend, Event } from '@suprsend/node-sdk';
import clientPromise from '../../lib/mongodb';
import fetchRedditPosts from '../../lib/reddit';

// Initialize Suprsend client
const workspaceKey = process.env.SUPRSEND_WORKSPACE_KEY;
const workspaceSecret = process.env.SUPRSEND_WORKSPACE_SECRET;

if (!workspaceKey || workspaceKey.length < 20) {
  throw new Error('Invalid SuprSend workspace key. Ensure it is at least 20 characters long.');
}

if (!workspaceSecret || workspaceSecret.length < 20) {
  throw new Error('Invalid SuprSend workspace secret. Ensure it is at least 20 characters long.');
}

const suprClient = new Suprsend(workspaceKey, workspaceSecret);

// Function to send an event to SuprSend
async function sendEvent(userId, results) {
  try {
    // Simplify or truncate the results to stay within the 100KB limit
    const truncatedResults = results.map(result => ({
      id: result.id,
      title: result.title,
      url: result.url,
      // Add only essential fields
    }));

    const properties = {
      results: truncatedResults,  // Attach the truncated Reddit results here
    };

    const event = new Event(
      userId,
      'daily_search_results',  // Event name should match the one from your SuprSend workflow
      properties,
      {
        tenant_id: 'default',  // Optional
        idempotency_key: `${userId}-${Date.now()}`,  // Generate a unique idempotency key
      }
    );

    const response = await suprClient.track_event(event);

    console.log('Event response:', response);

    if (response.status === 'success') {
      console.log(`Event sent successfully for user ${userId}`);
    } else {
      console.error(`Failed to send event for user ${userId}: ${response.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`Error sending event for user ${userId}:`, error);
  }
}

// API route handler
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('myDatabase');
    const users = await db.collection('userKeywords').find({}).toArray();

    for (const user of users) {
      const { userId, keywords } = user;

      for (const keyword of keywords) {
        const data = await fetchRedditPosts({
          keywords: [keyword],
          resultLimit: 10,
          timeFilter: 'day',
        });

        // Store the search results in the database
        await db.collection('dailySearchResults').updateOne(
          { userId, keyword },
          { $set: { data, date: new Date() } },
          { upsert: true }
        );
      }
    }

    // Prepare and send events
    for (const user of users) {
      const { userId } = user;

      const results = await db.collection('dailySearchResults').find({ userId }).toArray();

      // Send event to SuprSend
      await sendEvent(userId, results);
    }

    return new Response('Daily search completed and notifications sent', { status: 200 });
  } catch (error) {
    console.error('Error during daily search:', error);
    return new Response('Error during daily search', { status: 500 });
  }
}
