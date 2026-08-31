import express from 'express';
import { PrismaClient } from '@prisma/client';
import { validate } from '../utils/validation.js';
import { timetableSchema } from '../utils/validation.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all timetables (public)
router.get('/', async (req, res) => {
      try {
            const { page = 1, limit = 20, search = '' } = req.query;
            const skip = (page - 1) * limit;

            const where = {
                  ...(search && {
                        OR: [
                              { title: { contains: search, mode: 'insensitive' } },
                              { organization: { contains: search, mode: 'insensitive' } }
                        ]
                  })
            };

            const total = await prisma.timeTable.count({ where });
            const timetables = await prisma.timeTable.findMany({
                  where,
                  skip,
                  take: parseInt(limit),
                  orderBy: { createdAt: 'desc' },
                  select: {
                        id: true,
                        title: true,
                        organization: true,
                        description: true,
                        pdfUrl: true,
                        startDate: true,
                        endDate: true,
                        createdAt: true
                  }
            });

            res.json({
                  status: 'success',
                  data: timetables,
                  pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                  }
            });
      } catch (error) {
            console.error('Get timetables error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to fetch timetables'
            });
      }
});

// Get single timetable (public)
router.get('/:id', async (req, res) => {
      try {
            const { id } = req.params;

            const timetable = await prisma.timeTable.findUnique({
                  where: { id }
            });

            if (!timetable) {
                  return res.status(404).json({
                        status: 'error',
                        message: 'Timetable not found'
                  });
            }

            res.json({
                  status: 'success',
                  data: timetable
            });
      } catch (error) {
            console.error('Get timetable error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to fetch timetable'
            });
      }
});

export default router;