# Shelter Surfing Deployment Guide

## Prerequisites

- Node.js 16+ and npm
- PostgreSQL database
- Cloudinary account for image storage
- Domain name and SSL certificate
- Vercel account (frontend)
- Railway or Fly.io account (backend)

## Environment Variables

### Frontend (.env.production)
```
VITE_API_URL=https://api.shelter-surfing.com
VITE_SOCKET_URL=wss://api.shelter-surfing.com
```

### Backend (.env)
```
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=your-secure-jwt-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=3000
NODE_ENV=production
```

## Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables in Vercel dashboard
5. Deploy

## Backend Deployment (Railway)

1. Push your code to GitHub
2. Create new project in Railway
3. Add PostgreSQL service
4. Configure environment variables
5. Add custom domain (api.shelter-surfing.com)
6. Deploy

## Database Migration

1. Update your schema if needed:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

2. Verify database connection:
   ```bash
   npx prisma db seed
   ```

## SSL/HTTPS Setup

1. Configure SSL certificates through your hosting provider
2. Ensure all endpoints use HTTPS
3. Update CORS settings with your domain

## Post-Deployment Checklist

- [ ] Verify all API endpoints are accessible
- [ ] Test WebSocket connections
- [ ] Confirm image uploads work
- [ ] Check database migrations
- [ ] Test user authentication
- [ ] Monitor error logs
- [ ] Set up monitoring (e.g., Sentry)
- [ ] Configure backups
- [ ] Test all main features
- [ ] Verify security headers

## Monitoring and Maintenance

1. Set up error tracking (Sentry)
2. Configure logging (Winston)
3. Set up performance monitoring
4. Schedule regular backups
5. Plan update strategy

## Backup Strategy

1. Database:
   - Daily automated backups
   - Weekly full backups
   - Monthly archives
   - Retain backups for 3 months

2. User uploads:
   - Cloudinary handles media backup
   - Regular backup verification

## Performance Optimization

1. Frontend:
   - Enable Gzip compression
   - Implement lazy loading
   - Use CDN for static assets
   - Optimize bundle size

2. Backend:
   - Enable response compression
   - Implement caching
   - Optimize database queries
   - Use connection pooling

## Security Measures

1. Enable security headers
2. Implement rate limiting
3. Use secure session cookies
4. Enable CORS protection
5. Implement input validation
6. Regular security audits

## Troubleshooting

Common issues and solutions:

1. Database connection issues:
   - Check connection string
   - Verify network access
   - Check credentials

2. Image upload failures:
   - Verify Cloudinary credentials
   - Check file size limits
   - Verify CORS settings

3. Authentication issues:
   - Check JWT configuration
   - Verify cookie settings
   - Check HTTPS setup

## Scaling Considerations

1. Database:
   - Connection pooling
   - Read replicas
   - Query optimization

2. Application:
   - Load balancing
   - Horizontal scaling
   - Caching strategy

3. Storage:
   - CDN integration
   - Object storage
   - Backup automation

## Contact & Support

For deployment support:
- Technical issues: Create GitHub issue
- Security concerns: security@shelter-surfing.com
- General support: support@shelter-surfing.com 