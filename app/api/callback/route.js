// app/api/callback/route.js
export async function GET(req, res) {
    // Handle Reddit OAuth callback logic here
    res.status(200).json({ message: 'Callback handled' });
  }
  