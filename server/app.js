const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const winston = require('winston');
const expressWinston = require('express-winston');

const config = require('./config/production');
const authRoutes = require('./routes/authRoutes');
const shelterRoutes = require('./routes/shelterRoutes');
const requestRoutes = require('./routes/requestRoutes');
const matchRoutes = require('./routes/matchRoutes');
const messageRoutes = require('./routes/messageRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const imageRoutes = require('./routes/imageRoutes');

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
  cors: config.corsOptions
});

// Logging configuration
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Request logging
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: false
}));

// Security middleware
app.use(helmet()); // Security headers
app.use(cors(config.corsOptions)); // CORS
app.use(compression()); // Gzip compression

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply security headers
app.use((req, res, next) => {
  Object.entries(config.securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/images', imageRoutes);

// Error logging
app.use(expressWinston.errorLogger({
  winstonInstance: logger
}));

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred'
      : err.message
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('message', async (data) => {
    try {
      // Handle message sending logic
      io.to(data.recipientId).emit('message', data);
    } catch (error) {
      logger.error('Socket message error:', error);
    }
  });

  socket.on('typing', (data) => {
    socket.to(data.recipientId).emit('typing', {
      senderId: data.senderId,
      conversationId: data.conversationId
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Export for testing
module.exports = {
  app,
  httpServer,
  io
}; 