import express from 'express';
import { PrismaClient } from '@prisma/client';
import { validate, validateQuery } from '../utils/validation.js';
import { jobSchema, jobQuerySchema } from '../utils/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all jobs (public)
router.get('/', validateQuery(jobQuerySchema), async (req, res) => {
      try {
            const {
                  type,
                  status,
                  search,
                  page,
                  limit,
                  sortBy,
                  sortOrder
            } = req.query;

            // Default to published jobs for non-admins
            const queryStatus = req.user?.role === 'ADMIN' ? status : 'PUBLISHED';

            // Build where clause
            const where = {
                  ...(type && { type }),
                  ...(queryStatus && { status: queryStatus }),
                  ...(search && {
                        OR: [
                              { title: { contains: search, mode: 'insensitive' } },
                              { organization: { contains: search, mode: 'insensitive' } },
                              { location: { contains: search, mode: 'insensitive' } },
                              { qualification: { contains: search, mode: 'insensitive' } }
                        ]
                  })
            };

            // Calculate pagination
            const skip = (page - 1) * limit;

            // Get total count
            const total = await prisma.job.count({ where });

            // Get jobs
            const jobs = await prisma.job.findMany({
                  where,
                  orderBy: {
                        [sortBy]: sortOrder
                  },
                  skip,
                  take: limit,
                  select: {
                        id: true,
                        title: true,
                        type: true,
                        organization: true,
                        location: true,
                        qualification: true,
                        salary: true,
                        lastDate: true,
                        status: true,
                        isFeatured: true,
                        views: true,
                        applications: true,
                        createdAt: true,
                        ...(req.user?.role === 'ADMIN' && {
                              createdBy: true,
                              updatedBy: true
                        })
                  }
            });

            res.json({
                  status: 'success',
                  data: jobs,
                  pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                  }
            });
      } catch (error) {
            console.error('Get jobs error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to fetch jobs'
            });
      }
});

// Get single job (public)
router.get('/:id', async (req, res) => {
      try {
            const { id } = req.params;

            const job = await prisma.job.findUnique({
                  where: { id },
                  select: {
                        id: true,
                        title: true,
                        type: true,
                        organization: true,
                        department: true,
                        location: true,
                        qualification: true,
                        ageLimit: true,
                        salary: true,
                        vacancies: true,
                        applicationStart: true,
                        lastDate: true,
                        examDate: true,
                        description: true,
                        officialWebsite: true,
                        notificationPdf: true,
                        applyLink: true,
                        status: true,
                        isFeatured: true,
                        views: true,
                        applications: true,
                        createdAt: true,
                        updatedAt: true
                  }
            });

            if (!job) {
                  return res.status(404).json({
                        status: 'error',
                        message: 'Job not found'
                  });
            }

            // Increment view count
            if (job.status === 'PUBLISHED') {
                  await prisma.job.update({
                        where: { id },
                        data: { views: { increment: 1 } }
                  });
            }

            res.json({
                  status: 'success',
                  data: job
            });
      } catch (error) {
            console.error('Get job error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to fetch job'
            });
      }
});

// Create job (admin only)
router.post('/', authenticate, authorize('ADMIN'), validate(jobSchema), async (req, res) => {
      try {
            const jobData = {
                  ...req.body,
                  createdBy: req.user.id,

                  ...(req.body.applicationStart && {
                        applicationStart: new Date(req.body.applicationStart)
                  }),

                  ...(req.body.lastDate
                        ? {
                              lastDate: new Date(req.body.lastDate)
                        }
                        : req.body.type === 'ADMIT_CARD' && req.body.examDate
                              ? {
                                    lastDate: new Date(req.body.examDate)
                              }
                              : {}),

                  ...(req.body.examDate && {
                        examDate: new Date(req.body.examDate)
                  })
            };

            const job = await prisma.job.create({
                  data: jobData,
                  select: {
                        id: true,
                        title: true,
                        type: true,
                        organization: true,
                        location: true,
                        qualification: true,
                        lastDate: true,
                        status: true,
                        createdAt: true
                  }
            });

            res.status(201).json({
                  status: 'success',
                  message: 'Job created successfully',
                  data: job
            });
      } catch (error) {
            console.error('Create job error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to create job'
            });
      }
});

// Update job (admin only)
router.put('/:id', authenticate, authorize('ADMIN'), validate(jobSchema.partial()), async (req, res) => {
      try {
            const { id } = req.params;

            // Check if job exists
            const existingJob = await prisma.job.findUnique({
                  where: { id }
            });

            if (!existingJob) {
                  return res.status(404).json({
                        status: 'error',
                        message: 'Job not found'
                  });
            }

            const updateData = {
                  ...req.body,
                  updatedBy: req.user.id,
                  ...(req.body.applicationStart && { applicationStart: new Date(req.body.applicationStart) }),
                  ...(req.body.lastDate && { lastDate: new Date(req.body.lastDate) }),
                  ...(req.body.examDate && { examDate: new Date(req.body.examDate) }),
                  ...(req.body.status === 'PUBLISHED' && !existingJob.publishedAt && {
                        publishedAt: new Date(),
                        publishedBy: req.user.id
                  })
            };

            const job = await prisma.job.update({
                  where: { id },
                  data: updateData,
                  select: {
                        id: true,
                        title: true,
                        type: true,
                        organization: true,
                        location: true,
                        qualification: true,
                        lastDate: true,
                        status: true,
                        updatedAt: true
                  }
            });

            res.json({
                  status: 'success',
                  message: 'Job updated successfully',
                  data: job
            });
      } catch (error) {
            console.error('Update job error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to update job'
            });
      }
});

// Delete job (admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
      try {
            const { id } = req.params;

            // Check if job exists
            const existingJob = await prisma.job.findUnique({
                  where: { id }
            });

            if (!existingJob) {
                  return res.status(404).json({
                        status: 'error',
                        message: 'Job not found'
                  });
            }

            // Delete related saved jobs first
            await prisma.savedJob.deleteMany({
                  where: { jobId: id }
            });

            // Delete job
            await prisma.job.delete({
                  where: { id }
            });

            res.json({
                  status: 'success',
                  message: 'Job deleted successfully'
            });
      } catch (error) {
            console.error('Delete job error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to delete job'
            });
      }
});

// Get jobs by type
router.get('/type/:type', validateQuery(jobQuerySchema), async (req, res) => {
      try {
            const { type } = req.params;
            const { page, limit, search, sortBy, sortOrder } = req.query;

            // Validate job type
            const validTypes = ['GOVERNMENT', 'PRIVATE', 'INTERNSHIP', 'SCHOLARSHIP', 'HACKATHON', 'PLACEMENT_DRIVE', 'COURSE'];
            if (!validTypes.includes(type.toUpperCase())) {
                  return res.status(400).json({
                        status: 'error',
                        message: 'Invalid job type'
                  });
            }

            const where = {
                  type: type.toUpperCase(),
                  status: 'PUBLISHED',
                  ...(search && {
                        OR: [
                              { title: { contains: search, mode: 'insensitive' } },
                              { organization: { contains: search, mode: 'insensitive' } },
                              { location: { contains: search, mode: 'insensitive' } }
                        ]
                  })
            };

            const skip = (page - 1) * limit;

            const total = await prisma.job.count({ where });

            const jobs = await prisma.job.findMany({
                  where,
                  orderBy: {
                        [sortBy]: sortOrder
                  },
                  skip,
                  take: limit,
                  select: {
                        id: true,
                        title: true,
                        type: true,
                        organization: true,
                        location: true,
                        qualification: true,
                        salary: true,
                        lastDate: true,
                        isFeatured: true,
                        views: true,
                        createdAt: true
                  }
            });

            res.json({
                  status: 'success',
                  data: jobs,
                  pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                  }
            });
      } catch (error) {
            console.error('Get jobs by type error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to fetch jobs'
            });
      }
});

// Save/unsave job (authenticated users)
router.post('/:id/save', authenticate, async (req, res) => {
      try {
            const { id } = req.params;
            const userId = req.user.id;

            // Check if job exists
            const job = await prisma.job.findUnique({
                  where: { id, status: 'PUBLISHED' }
            });

            if (!job) {
                  return res.status(404).json({
                        status: 'error',
                        message: 'Job not found'
                  });
            }

            // Check if already saved
            const existingSaved = await prisma.savedJob.findUnique({
                  where: {
                        userId_jobId: {
                              userId,
                              jobId: id
                        }
                  }
            });

            if (existingSaved) {
                  // Unsave
                  await prisma.savedJob.delete({
                        where: {
                              userId_jobId: {
                                    userId,
                                    jobId: id
                              }
                        }
                  });

                  return res.json({
                        status: 'success',
                        message: 'Job unsaved successfully',
                        saved: false
                  });
            }

            // Save
            await prisma.savedJob.create({
                  data: {
                        userId,
                        jobId: id
                  }
            });

            res.json({
                  status: 'success',
                  message: 'Job saved successfully',
                  saved: true
            });
      } catch (error) {
            console.error('Save job error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to save job'
            });
      }
});

// Get saved jobs (authenticated users)
router.get('/user/saved', authenticate, async (req, res) => {
      try {
            const userId = req.user.id;

            const savedJobs = await prisma.savedJob.findMany({
                  where: { userId },
                  include: {
                        job: {
                              select: {
                                    id: true,
                                    title: true,
                                    type: true,
                                    organization: true,
                                    location: true,
                                    qualification: true,
                                    salary: true,
                                    lastDate: true,
                                    status: true,
                                    createdAt: true
                              }
                        }
                  },
                  orderBy: {
                        createdAt: 'desc'
                  }
            });

            res.json({
                  status: 'success',
                  data: savedJobs.map(item => item.job)
            });
      } catch (error) {
            console.error('Get saved jobs error:', error);
            res.status(500).json({
                  status: 'error',
                  message: 'Failed to fetch saved jobs'
            });
      }
});

export default router;