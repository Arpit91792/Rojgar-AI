# Rojgar AI - Complete Career Portal

A full-stack production-ready career portal built with modern technologies for job seekers, students, and professionals.

## 🚀 Technology Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** for styling
- **React Router DOM** for routing
- **Axios** for HTTP requests
- **React Query** for data fetching
- **Lucide React** for icons

### Backend
- **Node.js** with **Express.js**
- **Prisma ORM** for database
- **PostgreSQL** (Neon) as database
- **JWT Authentication** with HTTP-only cookies
- **Role-Based Access Control** (Admin/User)

### Security Features
- Helmet for security headers
- CORS protection
- Rate limiting
- Input validation with Zod
- Password hashing with bcrypt
- SQL injection protection
- XSS protection
- Environment variables
- Secure cookies

## 📁 Project Structure

```
rojgar-ai/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Layout components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   ├── assets/        # Static assets
│   │   └── styles/        # Global styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Data models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   ├── prisma/           # Database schema
│   ├── package.json
│   └── .env.example
│
└── README.md             # This file
```

## ✨ Features

### User Features
- 📱 **Modern sidebar navigation** with icons and categories
- 🔍 **Job search** with filters and pagination
- 🏛️ **Job categories**: Government, Private, Internships, Scholarships
- 📄 **Job details** with all information and application links
- ❤️ **Save jobs** for later
- 📊 **Dashboard** with job stats
- 🔔 **Notifications** for new opportunities
- 🤖 **AI Resume Builder** (feature placeholder)
- 🤖 **AI Interview Practice** (feature placeholder)
- 📱 **Fully responsive** design

### Admin Features
- 👑 **Admin dashboard** with statistics
- 📝 **CRUD operations** for jobs
- 👥 **User management**
- 📊 **Analytics and reports**
- ⚙️ **System settings**
- 📅 **Manage results and timetables**

### Technical Features
- 🛡️ **JWT authentication** with refresh tokens
- 🍪 **HTTP-only cookies** for security
- 🔐 **Role-based access control**
- 📡 **RESTful API** design
- 🗄️ **Database migrations** with Prisma
- 📝 **Input validation** with Zod
- ⚡ **Performance optimizations**
- 📱 **Mobile-first responsive design**
- 🌐 **CORS configuration**
- ⏱️ **Rate limiting**

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database (or use Neon)
3. **npm** or **yarn**

### Installation

#### 1. Clone and setup
```bash
# Clone the repository
git clone <repository-url>
cd rojgar-ai

# Create environment files
cp server/.env.example server/.env
```

#### 2. Configure environment variables
Edit `server/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/rojgar_ai_db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
PORT=5000
CLIENT_URL="http://localhost:3000"
```

#### 3. Install dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

#### 4. Set up database
```bash
# From server directory
cd server

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed
```

#### 5. Start development servers
```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend server
cd client
npm run dev
```

#### 6. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health
- Prisma Studio: http://localhost:5555 (run `npx prisma studio`)

## 📦 Database Schema

Key models:
- **Users** (Admin/User roles)
- **Jobs** (Government, Private, Internships, etc.)
- **SavedJobs** (User saved jobs)
- **Results** (Exam results)
- **TimeTables** (Exam schedules)
- **AdmitCards** (Hall tickets)
- **Blogs** (Blog posts)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (Admin only)
- `PUT /api/jobs/:id` - Update job (Admin only)
- `DELETE /api/jobs/:id` - Delete job (Admin only)
- `GET /api/jobs/type/:type` - Get jobs by type
- `POST /api/jobs/:id/save` - Save/unsave job
- `GET /api/jobs/user/saved` - Get user's saved jobs

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## 🎨 Design System

### Colors
- Primary: Blue (#2563EB)
- Background: White
- Text: Dark Gray
- Secondary: Light Gray

### Components
- Sidebar with collapsible navigation
- Job cards with hover effects
- Responsive grid layouts
- Form inputs with validation
- Pagination components
- Loading states and skeletons

## 🔒 Security Best Practices

1. **Authentication**: JWT with HTTP-only cookies
2. **Authorization**: Role-based access control
3. **Input Validation**: Zod schemas for all inputs
4. **Database**: Prisma ORM prevents SQL injection
5. **Headers**: Helmet for security headers
6. **CORS**: Configured for specific origins
7. **Rate Limiting**: Prevents brute force attacks
8. **Error Handling**: Centralized error handling

## 📱 Responsive Design

- **Desktop**: Full sidebar navigation
- **Tablet**: Responsive grid layouts
- **Mobile**: Collapsible sidebar, touch-friendly buttons

## 🚀 Deployment

### Backend Deployment
```bash
# Build and start production server
cd server
npm run build
npm start
```

### Frontend Deployment
```bash
# Build for production
cd client
npm run build

# The build output will be in client/dist/
```

### Database
- Use **Neon PostgreSQL** for production
- Configure connection pooling
- Set up automatic backups
- Monitor performance

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

## 📈 Performance Optimization

- **Code splitting** with React.lazy()
- **Image optimization**
- **Debounced search**
- **Pagination** for large datasets
- **React Query** for caching
- **Server-side filtering**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is for educational purposes.

## 📞 Support

For support or questions:
- Create an issue in the repository
- Check the documentation

---

## 🎯 Quick Start Commands

```bash
# Development
npm run dev                   # Start both servers (requires pm2)
npm run dev:client           # Start frontend only
npm run dev:server           # Start backend only

# Production
npm run build                # Build both client and server
npm start                    # Start production server

# Database
npx prisma migrate dev       # Create and run migrations
npx prisma studio            # Open database GUI
npx prisma generate          # Generate Prisma client

# Testing
npm test                     # Run tests
```

## 🎉 Successfully Created

✅ Full-stack application with separate client and server
✅ Complete authentication system
✅ Job management with categories
✅ Admin dashboard
✅ Responsive design
✅ Security best practices
✅ Production-ready architecture