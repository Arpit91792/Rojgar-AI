import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticate = async (req, res, next) => {
      try {
            // Get token from Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                  return res.status(401).json({
                        status: 'error',
                        message: 'No token provided'
                  });
            }

            const token = authHeader.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if user exists and is active
            const user = await prisma.user.findUnique({
                  where: { id: decoded.userId, isActive: true },
                  select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        isActive: true
                  }
            });

            if (!user) {
                  return res.status(401).json({
                        status: 'error',
                        message: 'User not found or inactive'
                  });
            }

            // Attach user to request
            req.user = user;
            next();
      } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                  return res.status(401).json({
                        status: 'error',
                        message: 'Invalid token'
                  });
            }

            if (error instanceof jwt.TokenExpiredError) {
                  return res.status(401).json({
                        status: 'error',
                        message: 'Token expired'
                  });
            }

            console.error('Auth middleware error:', error);
            return res.status(500).json({
                  status: 'error',
                  message: 'Authentication failed'
            });
      }
};

export const authorize = (...roles) => {
      return (req, res, next) => {
            if (!req.user) {
                  return res.status(401).json({
                        status: 'error',
                        message: 'Authentication required'
                  });
            }

            if (!roles.includes(req.user.role)) {
                  return res.status(403).json({
                        status: 'error',
                        message: 'Insufficient permissions'
                  });
            }

            next();
      };
};

export const refreshToken = async (req, res, next) => {
      try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                  return res.status(401).json({
                        status: 'error',
                        message: 'Refresh token required'
                  });
            }

            // Check if refresh token exists in database
            const tokenRecord = await prisma.refreshToken.findUnique({
                  where: { token: refreshToken },
                  include: { user: true }
            });

            if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
                  return res.status(401).json({
                        status: 'error',
                        message: 'Invalid or expired refresh token'
                  });
            }

            // Generate new access token
            const accessToken = jwt.sign(
                  {
                        userId: tokenRecord.userId,
                        email: tokenRecord.user.email,
                        role: tokenRecord.user.role
                  },
                  process.env.JWT_SECRET,
                  { expiresIn: '15m' }
            );

            req.user = {
                  id: tokenRecord.userId,
                  email: tokenRecord.user.email,
                  name: tokenRecord.user.name,
                  role: tokenRecord.user.role
            };

            // Send new access token
            res.setHeader('Authorization', `Bearer ${accessToken}`);
            next();
      } catch (error) {
            console.error('Refresh token error:', error);
            return res.status(500).json({
                  status: 'error',
                  message: 'Token refresh failed'
            });
      }
};