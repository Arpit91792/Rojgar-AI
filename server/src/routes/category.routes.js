import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all job categories with counts
router.get('/', async (req, res) => {
      try {
            const categories = [
                  { type: 'GOVERNMENT', label: 'Government Jobs', icon: '🏛️' },
                  { type: 'PRIVATE', label: 'Private Jobs', icon: '💼' },
                  { type: 'INTERNSHIP', label: 'Internships', icon: '🎓' },
                  { type: 'SCHOLARSHIP', label: 'Scholarships', icon: '🏆' },
                  { type: 'HACKATHON', label: 'Hackathons', icon: '🏅' },
                  { type: 'PLACEMENT_DRIVE', label: 'Placement Drives', icon: '💻' },
                  { type: 'COURSE', label: 'Courses', icon: '📚' }
            ];

            // Get counts for each category
            const counts = await Promise.all(
                  categories.map(async (category) => {
                        const count = await prisma.job.count({
                              where: {
                                    type: category.type,
                                    status: 'PUBLISHED'
                              }
                        });
                        return { ...category, count };
                  })
            );

            res.json({
                  status: 'success',
                  data: counts
            });
      } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to fetch categories'
            });
      }
});

// Get job stats by category
router.get('/stats', async (req, res) => {
      try {
            const stats = await prisma.job.groupBy({
                  by: ['type', 'status'],
                  _count: true,
                  where: {
                        status: { in: ['PUBLISHED', 'DRAFT', 'EXPIRED'] }
                  }
            });

            const formattedStats = stats.reduce((acc, stat) => {
                  if (!acc[stat.type]) {
                        acc[stat.type] = {};
                  }
                  acc[stat.type][stat.status] = stat._count;
                  return acc;
            }, {});

            res.json({
                  status: 'success',
                  data: formattedStats
            });
      } catch (error) {
            console.error('Get category stats error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to fetch category statistics'
            });
      }
});

export default router;