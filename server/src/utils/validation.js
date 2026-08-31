import { z } from 'zod';

const ALL_JOB_TYPES = [
      'GOVERNMENT', 'PRIVATE', 'INTERNSHIP',
      'SCHOLARSHIP', 'HACKATHON', 'PLACEMENT_DRIVE', 'COURSE',
      'TIME_TABLE', 'RESULT', 'ADMIT_CARD'
];

// User validation schemas
export const registerSchema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      role: z.enum(['USER', 'ADMIN']).optional().default('USER')
});

export const loginSchema = z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required')
});

// Job / Post validation schema
export const jobSchema = z.object({
      title: z.string().min(3, 'Title must be at least 3 characters'),
      type: z.enum(ALL_JOB_TYPES),
      organization: z.string().min(1, 'Organization is required'),
      department: z.string().optional().nullable(),
      // location & qualification optional to support TIME_TABLE/RESULT/ADMIT_CARD
      location: z.string().optional().nullable().default(''),
      qualification: z.string().optional().nullable().default(''),
      ageLimit: z.string().optional().nullable(),
      salary: z.string().optional().nullable(),
      vacancies: z.string().optional().nullable(),
      selectionProcess: z.string().optional().nullable(),
      applicationStart: z
            .string()
            .optional()
            .nullable()
            .refine(v => !v || /^\d{4}-\d{2}-\d{2}$/.test(v) || !isNaN(Date.parse(v)), 'Invalid date'),
      lastDate: z
            .string()
            .optional()
            .nullable()
            .refine(v => !v || /^\d{4}-\d{2}-\d{2}$/.test(v) || !isNaN(Date.parse(v)), 'Invalid date'),
      examDate: z
            .string()
            .optional()
            .nullable()
            .refine(v => !v || /^\d{4}-\d{2}-\d{2}$/.test(v) || !isNaN(Date.parse(v)), 'Invalid date'),
      description: z.string().optional().nullable(),
      officialWebsite: z.string().optional().nullable(),
      notificationPdf: z.string().optional().nullable(),
      applyLink: z.string().optional().nullable(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'EXPIRED']).optional().default('DRAFT'),
      isFeatured: z.boolean().optional().default(false)
});

export const jobUpdateSchema = jobSchema.partial();

export const jobQuerySchema = z.object({
      type: z.enum(ALL_JOB_TYPES).optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'EXPIRED']).optional(),
      search: z.string().optional(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(20),
      sortBy: z.enum(['createdAt', 'lastDate', 'title', 'organization']).default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Result validation (kept for legacy /api/results route)
export const resultSchema = z.object({
      title: z.string().min(3, 'Title must be at least 3 characters'),
      organization: z.string().min(2, 'Organization must be at least 2 characters'),
      description: z.string().optional(),
      resultUrl: z.string().optional().nullable(),
      pdfUrl: z.string().optional().nullable()
});

// TimeTable validation (kept for legacy /api/timetable route)
export const timetableSchema = z.object({
      title: z.string().min(3, 'Title must be at least 3 characters'),
      organization: z.string().min(2, 'Organization must be at least 2 characters'),
      description: z.string().optional(),
      pdfUrl: z.string().optional().nullable(),
      startDate: z.string().optional().nullable(),
      endDate: z.string().optional().nullable()
});

// Validation middleware
export const validate = (schema) => (req, res, next) => {
      try {
            const validatedData = schema.parse(req.body);
            req.body = validatedData;
            next();
      } catch (error) {
            if (error instanceof z.ZodError) {
                  const errors = error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                  }));
                  return res.status(400).json({
                        status: 'error',
                        message: 'Validation failed',
                        errors
                  });
            }
            next(error);
      }
};

export const validateQuery = (schema) => (req, res, next) => {
      try {
            const validatedData = schema.parse(req.query);
            req.query = validatedData;
            next();
      } catch (error) {
            if (error instanceof z.ZodError) {
                  const errors = error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                  }));
                  return res.status(400).json({
                        status: 'error',
                        message: 'Query validation failed',
                        errors
                  });
            }
            next(error);
      }
};
