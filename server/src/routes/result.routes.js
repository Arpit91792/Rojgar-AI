import express from 'express';
import { PrismaClient } from '@prisma/client';
import { validate } from '../utils/validation.js';
import { resultSchema } from '../utils/validation.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all results (public)
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

            const total = await prisma.result.count({ where });
            const results = await prisma.result.findMany({
                  where,
                  skip,
                  take: parseInt(limit),
                  orderBy: { createdAt: 'desc' },
                  select: {
                        id: true,
                        title: true,
                        organization: true,
                        description: true,
                        resultUrl: true,
                        pdfUrl: true,
                        publishedAt: true,
                        createdAt: true
                  }
            });

            res.json({
                  status: 'success',
                  data: results,
                  pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                  }
            });
      } catch (error) {
            console.error('Get results error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to fetch results'
            });
      }
});

// Get single result (public)
router.get('/:id', async (req, res) => {
      try {
            const { id } = req.params;

            const result = await prisma.result.findUnique({
                  where: { id }
            });

            if (!result) {
                  return res.status(404).json({
                        status: 'error',
                        message: 'Result not found'
                  });
            }

            res.json({
                  status: 'success',
                  data: result
            });
      } catch (error) {
            console.error('Get result error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to fetch result'
            });
      }
});

export default router;