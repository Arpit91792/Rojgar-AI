# Rojgar AI - Setup Guide

## 🚀 Quick Start

### Option 1: Quick Development Setup (No Database Required)
Run this if you want to test the frontend without backend database:

```bash
# Start frontend only
cd client
npm run dev
```

Access: http://localhost:3000

### Option 2: Complete Setup (With Database)

## 📋 Prerequisites

1. **Node.js** v18 or higher
2. **PostgreSQL** (or use SQLite alternative)
3. **npm** or **yarn**

## 🗄️ Database Setup

### Option A: PostgreSQL (Recommended)

1. Install PostgreSQL from https://www.postgresql.org/download/
2. Start PostgreSQL service
3. Create database:
```sql
CREATE DATABASE rojgar_ai_db;
```

### Option B: SQLite (Simpler for development)

Update `server/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

Then update `server/.env`:
```env
DATABASE_URL="file:./dev.db"
```

## 🔧 Installation Steps

### 1. Clone and Navigate
```bash
cd "D:\Rojgar AI"
```

### 2. Backend Setup
```bash
cd server

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Create .env file (if not exists)
# Use the provided .env.example as template

# Run database setup (creates sample data)
npm run setup
```

### 3. Frontend Setup
```bash
cd ../client

# Install dependencies
npm install
```

### 4. Start Servers

#### Terminal 1: Backend Server
```bash
cd server
npm run dev
```
Backend runs on: http://localhost:5000

#### Terminal 2: Frontend Server
```bash
cd client
npm run dev
```
Frontend runs on: http://localhost:3000

## 🔐 Default Login Credentials

After running `npm run setup`:

**Admin Account:**
- Email: `admin@rojgarai.com`
- Password: `admin123`

**User Account:**
- Email: `user@example.com`
- Password: `user123`

## 🚨 Troubleshooting

### 1. "Can't reach database server"
```
Error: P1001: Can't reach database server at `localhost:5432`
```
**Solution:** 
- Start PostgreSQL service
- Or switch to SQLite (Option B above)

### 2. "Prisma client not initialized"
```
Error: @prisma/client did not initialize yet
```
**Solution:**
```bash
cd server
npm run prisma:generate
```

### 3. "nodemon not found"
```
'nodemon' is not recognized as an internal or external command
```
**Solution:**
```bash
npm install -g nodemon
# or run without nodemon:
node src/index.js
```

### 4. Frontend proxy error
If frontend can't connect to backend (port 3000 → 5000):
- Check backend is running on port 5000
- Check CORS configuration in `server/src/index.js`

## 📊 Sample Data

The setup script creates:
- 1 Admin user
- 1 Regular user  
- 3 Sample jobs (Software Engineer, Bank Manager, Marketing Intern)

## 🔧 Development Commands

```bash
# Backend commands (from server/)
npm run dev              # Start dev server
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Open database GUI
npm run setup            # Create sample data

# Frontend commands (from client/)
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health
- **Prisma Studio**: http://localhost:5555 (run `npx prisma studio`)

## 🎯 Quick Test

To verify everything is working:

1. Start both servers
2. Open http://localhost:3000
3. Click "Login" in top right
4. Use admin credentials
5. You should see dashboard with sample jobs

## 📝 Notes

- The app uses **JWT authentication** with HTTP-only cookies
- **Admin routes** are protected (only admin@rojgarai.com can access)
- **Sample data** is created by `npm run setup` command
- **Environment variables** are in `server/.env`

## 🆘 Need Help?

If you encounter issues:

1. Check error messages carefully
2. Verify all prerequisites are installed
3. Ensure database is running
4. Check all environment variables
5. Try the SQLite option for simpler setup

For SQLite setup, remember to:
1. Change `datasource db` to SQLite in schema.prisma
2. Update DATABASE_URL in .env
3. Run `npm run prisma:generate` again
4. Run `npm run setup`