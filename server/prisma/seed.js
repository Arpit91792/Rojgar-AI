/**
 * Prisma Seed Script — Rojgar AI
 *
 * Reads admin credentials from environment variables.
 * NEVER hardcodes passwords.
 * Run with: npx prisma db seed
 *           OR: node prisma/seed.js
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load .env from server root
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function main() {
      console.log('🌱 Starting Rojgar AI database seed...')

      // ── Validate required env vars ──────────────────────────────────────────────
      const adminEmail = process.env.ADMIN_EMAIL
      const adminPassword = process.env.ADMIN_PASSWORD
      const adminName = process.env.ADMIN_NAME || 'Admin'

      if (!adminEmail || !adminPassword) {
            console.error('❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD in server/.env')
            console.error('   Add them to server/.env and run again.')
            process.exit(1)
      }

      // ── Hash password (never store plain text) ──────────────────────────────────
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
      const passwordHash = await bcrypt.hash(adminPassword, saltRounds)

      // ── Upsert admin user ────────────────────────────────────────────────────────
      const admin = await prisma.user.upsert({
            where: { email: adminEmail },
            update: {
                  // Update password hash + role if admin already exists
                  password: passwordHash,
                  role: 'ADMIN',
                  isActive: true,
            },
            create: {
                  email: adminEmail,
                  name: adminName,
                  password: passwordHash,
                  role: 'ADMIN',
                  isActive: true,
            },
      })

      console.log(`✅ Admin account ready: ${admin.email} (role: ${admin.role})`)
      // Do NOT log the password — not even as a reminder

      // ── Confirm no plain password in DB ─────────────────────────────────────────
      const stored = await prisma.user.findUnique({ where: { email: adminEmail } })
      const isHashed = stored?.password?.startsWith('$2') // bcrypt hashes start with $2a or $2b
      console.log(`✅ Password stored as bcrypt hash: ${isHashed ? 'YES ✓' : 'NO — something went wrong!'}`)

      if (!isHashed) {
            console.error('❌ CRITICAL: Password was not hashed correctly!')
            process.exit(1)
      }

      console.log('\n🎉 Seed completed successfully.')
      console.log(`   Admin URL: http://localhost:5173/admin`)
      console.log(`   Login with the credentials from server/.env`)
}

main()
      .catch((e) => {
            console.error('❌ Seed failed:', e.message)
            process.exit(1)
      })
      .finally(async () => {
            await prisma.$disconnect()
      })
