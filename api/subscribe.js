export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const { MAILCHIMP_API_KEY, MAILCHIMP_AUDIENCE_ID, MAILCHIMP_SERVER } = process.env;

  if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID || !MAILCHIMP_SERVER) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const url = `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ message: 'Subscribed successfully' });
    }

    if (data.title === 'Member Exists') {
      return res.status(200).json({ message: 'You are already subscribed' });
    }

    return res.status(400).json({ error: data.detail || 'Subscription failed' });
  } catch {
    return res.status(500).json({ error: 'Failed to connect to mailing service' });
  }
}
