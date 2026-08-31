import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'
import { validate } from '../utils/validation.js'
import { loginSchema } from '../utils/validation.js'

const router = express.Router()
const prisma = new PrismaClient()

// ── Admin login rate limiter (stricter than global) ──────────────────────────
const adminLoginLimiter = rateLimit({
      windowMs: parseInt(process.env.ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
      max: parseInt(process.env.ADMIN_LOGIN_RATE_LIMIT_MAX) || 10,
      message: { status: 'error', message: 'Too many login attempts. Try again in 15 minutes.' },
      standardHeaders: true,
      legacyHeaders: false,
})

// Helper: generate token pair
function generateTokens(user) {
      const accessToken = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
      )
      const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
      )
      return { accessToken, refreshToken }
}

// Helper: set refresh token cookie
function setRefreshCookie(res, token) {
      res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
}

// ── POST /api/auth/admin/login ────────────────────────────────────────────────
// Dedicated admin login — verifies role === ADMIN
router.post('/admin/login', adminLoginLimiter, validate(loginSchema), async (req, res) => {
      try {
            const { email, password } = req.body

            // Find user — must be active
            const user = await prisma.user.findUnique({
                  where: { email, isActive: true },
            })

            // Generic error to prevent user enumeration
            if (!user) {
                  return res.status(401).json({ status: 'error', message: 'Invalid credentials' })
            }

            // Verify password (constant-time compare via bcrypt)
            const valid = await bcrypt.compare(password, user.password)
            if (!valid) {
                  return res.status(401).json({ status: 'error', message: 'Invalid credentials' })
            }

            // Must be ADMIN role
            if (user.role !== 'ADMIN') {
                  return res.status(403).json({ status: 'error', message: 'Access denied: admin role required' })
            }

            const { accessToken, refreshToken } = generateTokens(user)

            // Persist refresh token
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } })

            // Set HTTP-only cookie — token never reaches frontend JS
            setRefreshCookie(res, refreshToken)

            return res.json({
                  status: 'success',
                  message: 'Login successful',
                  data: {
                        user: {
                              id: user.id,
                              name: user.name,
                              email: user.email,
                              role: user.role,
                              // password NEVER returned
                        },
                        accessToken,
                        expiresIn: 15 * 60,
                  },
            })
      } catch (error) {
            console.error('Admin login error:', error.message)
            return res.status(500).json({ status: 'error', message: 'Login failed' })
      }
})

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// General login (kept for compatibility)
router.post('/login', validate(loginSchema), async (req, res) => {
      try {
            const { email, password } = req.body

            const user = await prisma.user.findUnique({ where: { email, isActive: true } })
            if (!user) {
                  return res.status(401).json({ status: 'error', message: 'Invalid credentials' })
            }

            const valid = await bcrypt.compare(password, user.password)
            if (!valid) {
                  return res.status(401).json({ status: 'error', message: 'Invalid credentials' })
            }

            const { accessToken, refreshToken } = generateTokens(user)

            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } })

            setRefreshCookie(res, refreshToken)

            return res.json({
                  status: 'success',
                  message: 'Login successful',
                  data: {
                        user: { id: user.id, name: user.name, email: user.email, role: user.role },
                        accessToken,
                        expiresIn: 15 * 60,
                  },
            })
      } catch (error) {
            console.error('Login error:', error.message)
            return res.status(500).json({ status: 'error', message: 'Login failed' })
      }
})

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
      try {
            const token = req.cookies.refreshToken
            if (token) {
                  await prisma.refreshToken.deleteMany({ where: { token } }).catch(() => { })
                  res.clearCookie('refreshToken')
            }
            return res.json({ status: 'success', message: 'Logged out' })
      } catch (error) {
            console.error('Logout error:', error.message)
            return res.status(500).json({ status: 'error', message: 'Logout failed' })
      }
})

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
      try {
            const token = req.cookies.refreshToken
            if (!token) return res.status(401).json({ status: 'error', message: 'Refresh token required' })

            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

            const record = await prisma.refreshToken.findUnique({
                  where: { token },
                  include: { user: true },
            })

            if (!record || record.expiresAt < new Date()) {
                  return res.status(401).json({ status: 'error', message: 'Invalid or expired token' })
            }

            const accessToken = jwt.sign(
                  { userId: decoded.userId, email: record.user.email, role: record.user.role },
                  process.env.JWT_SECRET,
                  { expiresIn: '15m' }
            )

            return res.json({ status: 'success', data: { accessToken, expiresIn: 15 * 60 } })
      } catch (error) {
            return res.status(401).json({ status: 'error', message: 'Invalid refresh token' })
      }
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
      try {
            const authHeader = req.headers.authorization
            if (!authHeader?.startsWith('Bearer ')) {
                  return res.status(401).json({ status: 'error', message: 'No token provided' })
            }

            const token = authHeader.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            const user = await prisma.user.findUnique({
                  where: { id: decoded.userId, isActive: true },
                  select: { id: true, name: true, email: true, role: true, createdAt: true },
            })

            if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })

            // password is explicitly excluded from select above
            return res.json({ status: 'success', data: user })
      } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                  return res.status(401).json({ status: 'error', message: 'Invalid token' })
            }
            return res.status(500).json({ status: 'error', message: 'Failed to get user' })
      }
})

export default router
