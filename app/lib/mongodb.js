import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  useNewUrlParser: true, // Ensure the use of the new URL parser
  useUnifiedTopology: true, // Use the new Server Discover and Monitoring engine
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the client across module reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch(err => {
      console.error('Failed to connect to MongoDB:', err);
      throw err; // Re-throw to handle it in the calling code
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, don't use a global variable; create a new client for each request
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    throw err; // Re-throw to handle it in the calling code
  });
}

export default clientPromise;
