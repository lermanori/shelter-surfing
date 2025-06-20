# 🏠 Shelter Surfing

A platform connecting individuals offering temporary shelter with people seeking a place to stay.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd shelter-surfing
npm run install:all
```

### 2. Database Setup
1. Create a PostgreSQL database named `shelter_surfing`
2. Copy `server/.env.example` to `server/.env` and configure your database URL
3. Run database setup:
```bash
cd server
npm run db:generate
npm run db:push
```

### 3. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:client  # Frontend on http://localhost:5173
npm run dev:server  # Backend on http://localhost:3000
```

## 📁 Project Structure

```
shelter-surfing/
├── client/                 # React frontend (Vite)
│   ├── src/
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Express backend
│   ├── routes/            # API route handlers
│   ├── controllers/       # Business logic
│   ├── middlewares/       # Custom middleware
│   ├── prisma/           # Database schema
│   └── package.json
├── package.json           # Root workspace config
└── README.md
```

## 🛠 Tech Stack

### Frontend
- **React** (Vite) - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation (to be added)
- **React Hook Form** - Form handling (to be added)

### Backend
- **Express.js** - API framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication (to be added)
- **bcryptjs** - Password hashing (to be added)

## 📋 Current Status

### ✅ Completed
- [x] Project structure setup (monorepo)
- [x] React frontend with Vite + Tailwind CSS
- [x] Express backend with basic middleware
- [x] PostgreSQL database schema (Prisma)
- [x] Basic API route structure
- [x] Health check endpoint

### 🔄 In Progress
- [ ] Authentication system (JWT)
- [ ] User registration/login forms
- [ ] Shelter listing functionality
- [ ] Request submission system
- [ ] Matching algorithm

### 📝 Next Steps
1. Implement authentication endpoints
2. Build login/signup forms
3. Create shelter offering functionality
4. Add request submission system
5. Implement matching logic

## 🔧 Development

### Available Scripts
```bash
# Root level
npm run dev              # Start both frontend and backend
npm run dev:client       # Start frontend only
npm run dev:server       # Start backend only
npm run build            # Build both projects
npm run install:all      # Install all dependencies

# Frontend (client/)
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Backend (server/)
npm run dev              # Start with nodemon
npm run start            # Start production server
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Create and run migrations
npm run db:studio        # Open Prisma Studio
```

## 🌐 API Endpoints

### Health Check
- `GET /api/health` - Server status

### Authentication (Coming Soon)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Shelters (Coming Soon)
- `GET /api/shelters` - List all shelters
- `GET /api/shelters/:id` - Get shelter by ID
- `POST /api/shelters` - Create new shelter
- `PUT /api/shelters/:id` - Update shelter
- `DELETE /api/shelters/:id` - Delete shelter

### Requests (Coming Soon)
- `GET /api/requests` - List requests
- `POST /api/requests` - Submit request

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details 