import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { syntheticMarkerMiddleware } from '@swantron/otel-bootstrap';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple logger for the server
const logger = {
  info: (message, context = {}) => {
    console.log(`[${new Date().toISOString()}] [INFO] ${message}`, context);
  },
  warn: (message, context = {}) => {
    console.warn(`[${new Date().toISOString()}] [WARN] ${message}`, context);
  },
  error: (message, context = {}) => {
    console.error(`[${new Date().toISOString()}] [ERROR] ${message}`, context);
  },
};

const app = express();
const PORT = process.env.PORT || 8080;

app.use(compression());

// Stamp synthetic run ids from watchtron probes onto the active server span so
// the control plane can confirm probe traffic reached this instrumented origin.
app.use(syntheticMarkerMiddleware());

// Security middleware
app.use((req, res, next) => {
  // Log suspicious requests
  const suspiciousPatterns = [
    /\.(tar|gz|zip|rar|bak|backup|sql|db|dat|log)$/i,
    /\.(php|asp|jsp|cgi)$/i,
    /\.(env|config|ini)$/i,
    /admin|wp-|xmlrpc|phpmyadmin/i,
    /\.\./,
    /\/etc\/|\/proc\/|\/sys\//i,
  ];

  const isSuspicious = suspiciousPatterns.some(pattern =>
    pattern.test(req.path)
  );

  if (isSuspicious) {
    logger.warn('Suspicious request detected', {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      referer: req.get('Referer'),
      timestamp: new Date().toISOString(),
    });
  }

  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  // Log the request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    query: req.query,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - start;

    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      contentLength: res.get('Content-Length') || 0,
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
});

// Health check endpoints for DigitalOcean and monitoring
// Use /api/health to avoid conflict with React Router
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Server-side proxies for third-party APIs. Tokens live only in runtime env
// vars (never VITE_*), so they are never shipped in the client bundle. Each
// route is a fixed, read-only endpoint, and responses are cached briefly so
// public traffic can't burn through upstream rate limits.
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'swantron';
const DIGITALOCEAN_APP_ID =
  process.env.DIGITALOCEAN_APP_ID || '0513ce4c-b074-4139-bb38-a1c6a5bc97a6';
const PROXY_CACHE_TTL_MS = 60 * 1000;
const proxyCache = new Map();

const cachedJson = async (key, fetcher, ttlMs = PROXY_CACHE_TTL_MS) => {
  const hit = proxyCache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) {
    return hit.data;
  }
  const data = await fetcher();
  proxyCache.set(key, { at: Date.now(), data });
  return data;
};

const upstreamJson = async (url, headers) => {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Upstream ${response.status} ${response.statusText}`);
  }
  return response.json();
};

const proxyRoute = (name, token, handler) => async (req, res) => {
  if (!token) {
    res.status(503).json({ error: `${name} not configured` });
    return;
  }
  try {
    res.json(await handler(req));
  } catch (error) {
    logger.error(`${name} proxy request failed`, {
      path: req.path,
      error: error.message,
    });
    res.status(502).json({ error: `${name} request failed` });
  }
};

// Remove env var blocks (which can hold secret values) from a DO app spec.
const stripEnvs = value => {
  if (Array.isArray(value)) return value.map(stripEnvs);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== 'envs')
        .map(([key, v]) => [key, stripEnvs(v)])
    );
  }
  return value;
};

// GitHub is read unauthenticated: every watched repo is public, so no token is
// needed. The anonymous limit is 60 req/hour per IP, so cache for 10 minutes
// and only proxy the fixed set of repos the status page shows
// (8 upstream calls per 10 min = 48/hour).
const GITHUB_CACHE_TTL_MS = 10 * 60 * 1000;
const GITHUB_WATCHED_REPOS = new Set([
  'tronswan',
  'chomptron',
  'wrenchtron',
  'swantron',
  'mt',
  'uptime-monitor',
  'minifier-cli',
]);
const githubHeaders = {
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'TronSwan-Health-Monitor',
};

app.get(
  '/api/github/repos',
  proxyRoute('GitHub', true, () =>
    cachedJson(
      'github:repos',
      () =>
        upstreamJson(
          `https://api.github.com/users/${GITHUB_OWNER}/repos?sort=updated&per_page=10`,
          githubHeaders
        ),
      GITHUB_CACHE_TTL_MS
    )
  )
);

app.get('/api/github/repos/:repo/runs', (req, res, next) => {
  if (!GITHUB_WATCHED_REPOS.has(req.params.repo)) {
    res.status(404).json({ error: 'Unknown repository' });
    return;
  }
  next();
});

app.get(
  '/api/github/repos/:repo/runs',
  proxyRoute('GitHub', true, req =>
    cachedJson(
      `github:runs:${req.params.repo}`,
      () =>
        upstreamJson(
          `https://api.github.com/repos/${GITHUB_OWNER}/${req.params.repo}/actions/runs?per_page=10`,
          githubHeaders
        ),
      GITHUB_CACHE_TTL_MS
    )
  )
);

const digitalOceanHeaders = () => ({
  Authorization: `Bearer ${process.env.DIGITALOCEAN_TOKEN}`,
  'Content-Type': 'application/json',
});

app.get(
  '/api/digitalocean/app',
  proxyRoute('DigitalOcean', process.env.DIGITALOCEAN_TOKEN, () =>
    cachedJson('do:app', async () =>
      stripEnvs(
        await upstreamJson(
          `https://api.digitalocean.com/v2/apps/${DIGITALOCEAN_APP_ID}`,
          digitalOceanHeaders()
        )
      )
    )
  )
);

app.get(
  '/api/digitalocean/droplets',
  proxyRoute('DigitalOcean', process.env.DIGITALOCEAN_TOKEN, () =>
    cachedJson('do:droplets', () =>
      upstreamJson(
        'https://api.digitalocean.com/v2/droplets',
        digitalOceanHeaders()
      )
    )
  )
);

// Spotify health check: client-credentials token + a tiny search, done
// server-side so the client secret never reaches the browser.
app.get(
  '/api/health/spotify',
  proxyRoute('Spotify', process.env.SPOTIFY_CLIENT_SECRET, () =>
    cachedJson('spotify:health', async () => {
      // The client ID is public; reuse the build-time one if no runtime copy.
      const clientId =
        process.env.SPOTIFY_CLIENT_ID || process.env.VITE_SPOTIFY_CLIENT_ID;
      const basic = Buffer.from(
        `${clientId}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64');
      const tokenResponse = await fetch(
        'https://accounts.spotify.com/api/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${basic}`,
          },
          body: 'grant_type=client_credentials',
        }
      );
      if (!tokenResponse.ok) {
        throw new Error(`Spotify token ${tokenResponse.status}`);
      }
      const { access_token: accessToken } = await tokenResponse.json();
      await upstreamJson(
        'https://api.spotify.com/v1/search?q=test&type=track&limit=1',
        { Authorization: `Bearer ${accessToken}` }
      );
      return { status: 'ok' };
    })
  )
);

// Check if build directory exists
const buildDir = path.join(__dirname, 'build');
if (!existsSync(buildDir)) {
  logger.error('Build directory not found', { buildDir });
  process.exit(1);
}

// Serve static files. Files under /assets/ are content-hashed by Vite, so
// they can be cached forever; everything else (index.html, manifest, etc.)
// must revalidate so clients always pick up the latest asset hashes.
app.use(
  express.static(buildDir, {
    setHeaders: (res, filePath) => {
      if (filePath.startsWith(path.join(buildDir, 'assets') + path.sep)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

// Handle client-side routing (SPA) - catch all non-API routes
app.get(/^(?!\/api).*$/, (req, res) => {
  const indexPath = path.join(buildDir, 'index.html');
  if (!existsSync(indexPath)) {
    logger.error('index.html not found in build directory', { indexPath });
    res.status(500).send('Application not built correctly');
    return;
  }
  res.sendFile(indexPath);
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
  });

  res.status(500).send('Internal Server Error');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app
  .listen(PORT, () => {
    logger.info('Server started', {
      port: PORT,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      platform: 'Digital Ocean App Platform',
      buildpack: 'Node.js',
    });

    // Log that we're ready to serve requests
    logger.info('Application ready to serve requests', {
      staticFilesPath: path.join(__dirname, 'build'),
      spaFallback: true,
    });
  })
  .on('error', err => {
    logger.error('Server failed to start', {
      error: err.message,
      port: PORT,
      code: err.code,
    });
    process.exit(1);
  });
