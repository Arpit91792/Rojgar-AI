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

      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12

      // ── Admin accounts to seed ────────────────────────────────────────────────
      const admins = [
            {
                  email: process.env.ADMIN_EMAIL,
                  password: process.env.ADMIN_PASSWORD,
                  name: process.env.ADMIN_NAME || 'Admin',
            },
            {
                  email: process.env.ADMIN2_EMAIL,
                  password: process.env.ADMIN2_PASSWORD,
                  name: process.env.ADMIN2_NAME || 'Admin2',
            },
      ].filter((a) => a.email && a.password) // skip if not set

      if (admins.length === 0) {
            console.error('❌ No admin credentials found in server/.env')
            process.exit(1)
      }

      for (const { email, password, name } of admins) {
            const passwordHash = await bcrypt.hash(password, saltRounds)

            const admin = await prisma.user.upsert({
                  where: { email },
                  update: { password: passwordHash, role: 'ADMIN', isActive: true },
                  create: { email, name, password: passwordHash, role: 'ADMIN', isActive: true },
            })

            const stored = await prisma.user.findUnique({ where: { email } })
            const isHashed = stored?.password?.startsWith('$2')

            console.log(`✅ Admin ready: ${admin.email} | hash: ${isHashed ? 'OK ✓' : 'FAILED ✗'}`)

            if (!isHashed) {
                  console.error('❌ CRITICAL: Password was not hashed correctly!')
                  process.exit(1)
            }
      }

      console.log('\n🎉 Seed completed successfully.')
      console.log('   Admin URL: http://localhost:5173/admin')
      console.log('   Login with the credentials from server/.env')
}

main()
      .catch((e) => {
            console.error('❌ Seed failed:', e.message)
            process.exit(1)
      })
      .finally(async () => {
            await prisma.$disconnect()
      })
