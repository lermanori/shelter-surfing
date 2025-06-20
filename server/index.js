import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import socketService from './services/socketService.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import shelterRoutes from './routes/shelters.js';
import requestRoutes from './routes/requests.js';
import matchRoutes from './routes/matches.js';
import messageRoutes from './routes/messages.js';
import connectionRoutes from './routes/connections.js';
import imageRoutes from './routes/imageRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Trust the first proxy in front of the app (e.g., Railway's load balancer)
// This is required for express-rate-limit to work correctly.
app.set('trust proxy', 1);

// Initialize Socket.IO
socketService.initialize(server);

// Rate limiting - Much more relaxed for development and testing
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute (reduced from 15 minutes)
  max: 1000000, // limit each IP to 1,000,000 requests per minute (increased from 100 per 15 minutes)
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests, please try again later.',
      retryAfter: '1 minute'
    });
  }
});

// Middleware
app.use(helmet());

// Set up allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173', // Development frontend
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Shelter Surfing API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/images', imageRoutes);

// Placeholder routes for future implementation
app.use('/api/requests', (req, res) => {
  res.json({ message: 'Request routes coming soon' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
  console.log(`👤 User routes: http://localhost:${PORT}/api/users`);
  console.log(`🏠 Shelter routes: http://localhost:${PORT}/api/shelters`);
  console.log(`🖼️ Image routes: http://localhost:${PORT}/api/images`);
  console.log(`🔌 Socket.IO initialized`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;

 