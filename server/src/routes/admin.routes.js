import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require authentication and admin role
router.use(authenticate, authorize('ADMIN'));

// Get dashboard statistics
router.get('/stats', async (req, res) => {
      try {
            const [
                  totalUsers,
                  totalJobs,
                  publishedJobs,
                  totalApplications,
                  recentJobs,
                  recentUsers
            ] = await Promise.all([
                  prisma.user.count(),
                  prisma.job.count(),
                  prisma.job.count({ where: { status: 'PUBLISHED' } }),
                  prisma.job.aggregate({
                        _sum: { applications: true }
                  }),
                  prisma.job.findMany({
                        take: 5,
                        orderBy: { createdAt: 'desc' },
                        select: {
                              id: true,
                              title: true,
                              type: true,
                              organization: true,
                              status: true,
                              createdAt: true
                        }
                  }),
                  prisma.user.findMany({
                        take: 5,
                        orderBy: { createdAt: 'desc' },
                        select: {
                              id: true,
                              name: true,
                              email: true,
                              role: true,
                              createdAt: true
                        }
                  })
            ]);

            const jobStats = await prisma.job.groupBy({
                  by: ['type'],
                  _count: true,
                  where: { status: 'PUBLISHED' }
            });

            const dailyStats = await prisma.job.groupBy({
                  by: ['createdAt'],
                  _count: true,
                  where: {
                        createdAt: {
                              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                        }
                  },
                  orderBy: { createdAt: 'asc' }
            });

            res.json({
                  status: 'success',
                  data: {
                        overview: {
                              totalUsers,
                              totalJobs,
                              publishedJobs,
                              draftJobs: totalJobs - publishedJobs,
                              totalApplications: totalApplications._sum.applications || 0
                        },
                        jobDistribution: jobStats,
                        recentJobs,
                        recentUsers,
                        dailyStats: dailyStats.map(stat => ({
                              date: stat.createdAt.toISOString().split('T')[0],
                              count: stat._count
                        }))
                  }
            });
      } catch (error) {
            console.error('Get admin stats error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to fetch dashboard statistics'
            });
      }
});

// Get all users
router.get('/users', async (req, res) => {
      try {
            const { page = 1, limit = 20, search = '', role = '' } = req.query;
            const skip = (page - 1) * limit;

            const where = {
                  ...(search && {
                        OR: [
                              { name: { contains: search, mode: 'insensitive' } },
                              { email: { contains: search, mode: 'insensitive' } }
                        ]
                  }),
                  ...(role && { role })
            };

            const total = await prisma.user.count({ where });
            const users = await prisma.user.findMany({
                  where,
                  skip,
                  take: parseInt(limit),
                  orderBy: { createdAt: 'desc' },
                  select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true
                  }
            });

            res.json({
                  status: 'success',
                  data: users,
                  pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                  }
            });
      } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to fetch users'
            });
      }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
      try {
            const { id } = req.params;

            const user = await prisma.user.findUnique({
                  where: { id },
                  select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true
                  }
            });

            if (!user) {
                  return res.status(404).json({
                        status: 'error',
                        message: 'User not found'
                  });
            }

            // Get user's saved jobs
            const savedJobs = await prisma.savedJob.findMany({
                  where: { userId: id },
                  include: {
                        job: {
                              select: {
                                    id: true,
                                    title: true,
                                    type: true,
                                    organization: true,
                                    status: true
                              }
                        }
                  }
            });

            res.json({
                  status: 'success',
                  data: {
                        ...user,
                        savedJobs: savedJobs.map(item => item.job)
                  }
            });
      } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to fetch user'
            });
      }
});

// Update user
router.put('/users/:id', async (req, res) => {
      try {
            const { id } = req.params;
            const { name, role, isActive } = req.body;

            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                  where: { id }
            });

            if (!existingUser) {
                  return res.status(404).json({
                        status: 'error',
                        message: 'User not found'
                  });
            }

            // Cannot change own role
            if (id === req.user.id && role && role !== existingUser.role) {
                  return res.status(400).json({
                        status: 'error',
                        message: 'Cannot change your own role'
                  });
            }

            const user = await prisma.user.update({
                  where: { id },
                  data: {
                        ...(name && { name }),
                        ...(role && { role }),
                        ...(typeof isActive === 'boolean' && { isActive })
                  },
                  select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true,
                        updatedAt: true
                  }
            });

            res.json({
                  status: 'success',
                  message: 'User updated successfully',
                  data: user
            });
      } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to update user'
            });
      }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
      try {
            const { id } = req.params;

            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                  where: { id }
            });

            if (!existingUser) {
                  return res.status(404).json({
                        status: 'error',
                        message: 'User not found'
                  });
            }

            // Cannot delete yourself
            if (id === req.user.id) {
                  return res.status(400).json({
                        status: 'error',
                        message: 'Cannot delete your own account'
                  });
            }

            // Delete user's saved jobs first
            await prisma.savedJob.deleteMany({
                  where: { userId: id }
            });

            // Delete user's refresh tokens
            await prisma.refreshToken.deleteMany({
                  where: { userId: id }
            });

            // Delete user
            await prisma.user.delete({
                  where: { id }
            });

            res.json({
                  status: 'success',
                  message: 'User deleted successfully'
            });
      } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to delete user'
            });
      }
});

// Get system logs (placeholder)
router.get('/logs', async (req, res) => {
      try {
            // In a production system, you would query from a logs database or file
            res.json({
                  status: 'success',
                  data: {
                        message: 'Logs endpoint - implement with your logging system',
                        suggestions: [
                              'Use Winston or Morgan for logging',
                              'Store logs in Elasticsearch',
                              'Implement log rotation',
                              'Set up log monitoring'
                        ]
                  }
            });
      } catch (error) {
            console.error('Get logs error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to fetch logs'
            });
      }
});

export default router;