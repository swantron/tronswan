import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

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
  }
};

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use((req, res, next) => {
  // Log suspicious requests
  const suspiciousPatterns = [
    /\.(tar|gz|zip|rar|bak|backup|sql|db|dat|log)$/i,
    /\.(php|asp|jsp|cgi)$/i,
    /\.(env|config|ini)$/i,
    /admin|wp-|xmlrpc|phpmyadmin/i,
    /\.\./,
    /\/etc\/|\/proc\/|\/sys\//i
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(req.path));
  
  if (isSuspicious) {
    logger.warn('Suspicious request detected', {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      referer: req.get('Referer'),
      timestamp: new Date().toISOString()
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
    query: req.query
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      contentLength: res.get('Content-Length') || 0
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Handle client-side routing (SPA) - catch all non-API routes
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress
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

app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    platform: 'Digital Ocean App Platform',
    buildpack: 'Node.js'
  });
  
  // Log that we're ready to serve requests
  logger.info('Application ready to serve requests', {
    staticFilesPath: path.join(__dirname, 'build'),
    spaFallback: true
  });
}).on('error', (err) => {
  logger.error('Server failed to start', {
    error: err.message,
    port: PORT,
    code: err.code
  });
  process.exit(1);
});
