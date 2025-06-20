module.exports = {
  // Server configuration
  port: process.env.PORT || 3000,
  
  // CORS configuration
  corsOptions: {
    origin: [
      'https://shelter-surfing.com',
      'https://www.shelter-surfing.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  // Security headers
  securityHeaders: {
    'Content-Security-Policy': 
      "default-src 'self'; " +
      "img-src 'self' data: https: blob:; " +
      "media-src 'self' https:; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "font-src 'self' data: https:; " +
      "frame-src 'self' https:; " +
      "connect-src 'self' https: wss:;",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  },

  // Rate limiting
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 1000000, // limit each IP to 1000 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: '{"error":"Too many requests, please try again later."}' // Ensure JSON response
  },

  // JWT configuration
  jwt: {
    expiresIn: '7d',
    cookieOptions: {
      httpOnly: true,
      secure: true, // requires HTTPS
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  },

  // Logging configuration
  logging: {
    level: 'info',
    format: 'combined'
  }
}; 