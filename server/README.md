# Shelter Surfing Backend

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the server directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/shelter_surfing"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3000
NODE_ENV=development

# Client URL for CORS
CLIENT_URL="http://localhost:5173"

# Optional: External APIs
MAPBOX_TOKEN="your-mapbox-token-here"
```

### 2. Database Setup
1. Install PostgreSQL locally or use a cloud service
2. Create a database named `shelter_surfing`
3. Update the DATABASE_URL in your `.env` file
4. Run the following commands:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or create migrations
npm run db:migrate
```

### 3. Start Development Server
```bash
npm run dev
```

The server will start on http://localhost:3000

### 4. API Endpoints
- Health check: `GET /api/health`
- Auth routes: `POST /api/auth/register`, `POST /api/auth/login`
- User routes: `GET /api/users`, `PUT /api/users/:id`
- Shelter routes: `GET /api/shelters`, `POST /api/shelters`
- Request routes: `GET /api/requests`, `POST /api/requests` 