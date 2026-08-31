import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all internships (public)
router.get('/', async (req, res) => {
      try {
            const { page = 1, limit = 20, search = '' } = req.query;
            const skip = (page - 1) * limit;

            const where = {
                  type: 'INTERNSHIP',
                  status: 'PUBLISHED',
                  ...(search && {
                        OR: [
                              { title: { contains: search, mode: 'insensitive' } },
                              { organization: { contains: search, mode: 'insensitive' } },
                              { location: { contains: search, mode: 'insensitive' } }
                        ]
                  })
            };

            const total = await prisma.job.count({ where });
            const internships = await prisma.job.findMany({
                  where,
                  skip,
                  take: parseInt(limit),
                  orderBy: { createdAt: 'desc' },
                  select: {
                        id: true,
                        title: true,
                        organization: true,
                        location: true,
                        qualification: true,
                        salary: true,
                        lastDate: true,
                        description: true,
                        applyLink: true,
                        isFeatured: true,
                        createdAt: true
                  }
            });

            res.json({
                  status: 'success',
                  data: internships,
                  pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                  }
            });
      } catch (error) {
            console.error('Get internships error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to fetch internships'
            });
      }
});

export default router;