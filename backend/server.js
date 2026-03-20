const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fileUpload = require('express-fileupload');
const client = require('prom-client');

const { pool } = require('./config/database');
const { server: serverConfig } = require('./config/config');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');
const { requestContext } = require('./middleware/requestContext');
const { logger } = require('./config/logger');

const allowedOrigins = serverConfig.corsOrigins;

const app = express();
const PORT = serverConfig.port;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Prometheus metrics
client.collectDefaultMetrics();
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 1.5, 5, 10],
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    (req.logger || logger).error('Metrics error', err);
    res.status(500).end();
  }
});

// Request context (request id + per-request logger)
app.use(requestContext);

// Rate limiting
const limiter = rateLimit({
  windowMs: serverConfig.rateLimitWindowMinutes * 60 * 1000,
  max: serverConfig.rateLimitMax,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
// CORS: echo request origin and allow credentials
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
  }
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  abortOnLimit: true,
}));

// Compression middleware
app.use(compression());

// Request logging middleware
app.use((req, res, next) => {
  const log = req.logger || logger;
  const end = httpRequestDuration.startTimer();
  log.info('Incoming request', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  res.on('finish', () => {
    const route = req.route?.path || req.originalUrl || 'unknown_route';
    end({ method: req.method, route, status_code: res.statusCode });
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  pool.query('SELECT 1')
    .then(() => {
      res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        db: 'ok',
      });
    })
    .catch(() => {
      res.status(503).json({
        success: false,
        message: 'Database unreachable',
        timestamp: new Date().toISOString(),
      });
    });
});

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

const waitForDatabase = async (retries = 20, delayMs = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query('SELECT 1');
      logger.info('Connected to PostgreSQL database');
      return;
    } catch (err) {
      logger.warn(`DB not ready (attempt ${attempt}/${retries}): ${err.message}`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  logger.error('Database did not become ready in time');
  process.exit(1);
};

waitForDatabase().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${serverConfig.env}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  pool.end(() => {
    logger.info('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  pool.end(() => {
    logger.info('Database pool closed');
    process.exit(0);
  });
});

module.exports = app;
