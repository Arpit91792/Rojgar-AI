import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
      contentSecurityPolicy: {
            directives: {
                  defaultSrc: ["'self'"],
                  styleSrc: ["'self'", "'unsafe-inline'"],
                  scriptSrc: ["'self'"],
                  imgSrc: ["'self'", "data:", "https:"],
                  connectSrc: ["'self'", process.env.CLIENT_URL]
            }
      },
      crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Rate limiting
const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
      res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'Rojgar AI API',
            version: '1.0.0'
      });
});

// Database status endpoint
app.get('/db-status', async (req, res) => {
      try {
            const { PrismaClient } = await import('@prisma/client');
            const prisma = new PrismaClient();
            await prisma.$queryRaw`SELECT 1`;
            await prisma.$disconnect();

            res.json({
                  status: 'connected',
                  message: 'Database connection successful'
            });
      } catch (error) {
            res.status(503).json({
                  status: 'disconnected',
                  message: 'Database connection failed',
                  error: error.message,
                  solution: 'Run: npm run prisma:generate && npm run setup'
            });
      }
});

// Import and setup routes with error handling
async function setupRoutes() {
      try {
            const { default: authRoutes } = await import('./routes/auth.routes.js');
            const { default: jobRoutes } = await import('./routes/job.routes.js');
            const { default: categoryRoutes } = await import('./routes/category.routes.js');
            const { default: resultRoutes } = await import('./routes/result.routes.js');
            const { default: timetableRoutes } = await import('./routes/timetable.routes.js');
            const { default: internshipRoutes } = await import('./routes/internship.routes.js');
            const { default: adminRoutes } = await import('./routes/admin.routes.js');

            // API Routes
            app.use('/api/auth', authRoutes);
            app.use('/api/jobs', jobRoutes);
            app.use('/api/categories', categoryRoutes);
            app.use('/api/results', resultRoutes);
            app.use('/api/timetable', timetableRoutes);
            app.use('/api/internships', internshipRoutes);
            app.use('/api/admin', adminRoutes);

            console.log('✅ All routes loaded successfully');
      } catch (error) {
            console.error('❌ Failed to load routes:', error.message);

            // Create placeholder routes for development
            const placeholderRoute = (req, res) => {
                  res.status(503).json({
                        status: 'setup_required',
                        message: 'Backend setup required',
                        steps: [
                              '1. Run: npm run prisma:generate',
                              '2. Run: npm run setup',
                              '3. Restart server: npm run dev'
                        ],
                        endpoint: req.originalUrl
                  });
            };

            app.use('/api/auth', placeholderRoute);
            app.use('/api/jobs', placeholderRoute);
            app.use('/api/categories', placeholderRoute);
            app.use('/api/results', placeholderRoute);
            app.use('/api/timetable', placeholderRoute);
            app.use('/api/internships', placeholderRoute);
            app.use('/api/admin', placeholderRoute);

            console.log('⚠️  Using placeholder routes. Please run setup commands.');
      }
}

// Setup routes
await setupRoutes();

// 404 handler
app.use('*', (req, res) => {
      res.status(404).json({
            status: 'error',
            message: 'Route not found',
            path: req.originalUrl,
            available_routes: ['/health', '/db-status', '/api/*']
      });
});

// Global error handler
app.use((err, req, res, next) => {
      console.error('Error:', err);

      const statusCode = err.statusCode || 500;
      const message = err.message || 'Internal server error';

      res.status(statusCode).json({
            status: 'error',
            message: message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
});

// Start server
app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 DB Status: http://localhost:${PORT}/db-status`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📁 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
      console.log('\n📋 Setup Instructions:');
      console.log('1. Check database: http://localhost:5000/db-status');
      console.log('2. If disconnected, run: npm run prisma:generate && npm run setup');
      console.log('3. Restart server if needed');
});

export default app;