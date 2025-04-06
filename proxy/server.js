require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PROXY_PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Proxy endpoint for WordPress API
app.get('/wp-json/*', async (req, res) => {
  try {
    const targetUrl = `https://chomptron.com${req.originalUrl}`;
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const headers = {};
    
    // Forward relevant headers
    ['X-WP-Total', 'X-WP-TotalPages'].forEach(header => {
      if (response.headers.has(header)) {
        headers[header] = response.headers.get(header);
      }
    });

    res.set(headers).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch data from WordPress API' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
}); 