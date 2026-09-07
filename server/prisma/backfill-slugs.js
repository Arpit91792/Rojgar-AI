/**
 * backfill-slugs.js — One-time script to generate slugs for existing Job records.
 *
 * Run ONCE after the migration:
 *   node prisma/backfill-slugs.js
 *
 * This script:
 *  - Reads every Job that has no slug yet
 *  - Generates a slug from the title
 *  - Handles duplicates with a numeric suffix (-2, -3, …)
 *  - Updates each job in-place WITHOUT touching any other field
 */

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

function generateSlug(title) {
      return title
            .toString()
            .toLowerCase()
            .trim()
            .replace(/&/g, 'and')
            .replace(/[\s_]+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-{2,}/g, '-')
            .replace(/^-+|-+$/g, '')
}

async function ensureUniqueSlug(baseSlug, excludeId = null) {
      let slug = baseSlug
      let suffix = 2

      while (true) {
            const existing = await prisma.job.findUnique({
                  where: { slug },
                  select: { id: true },
            })
            if (!existing || existing.id === excludeId) return slug
            slug = `${baseSlug}-${suffix}`
            suffix++
      }
}

async function main() {
      console.log('🔄 Starting slug backfill for existing jobs...\n')

      // Fetch all jobs without a slug
      const jobs = await prisma.job.findMany({
            where: { slug: null },
            select: { id: true, title: true },
            orderBy: { createdAt: 'asc' },
      })

      if (jobs.length === 0) {
            console.log('✅ All jobs already have slugs. Nothing to do.')
            return
      }

      console.log(`📋 Found ${jobs.length} job(s) without a slug.\n`)

      let updated = 0
      let failed = 0

      for (const job of jobs) {
            try {
                  const base = generateSlug(job.title)
                  if (!base) {
                        console.warn(`⚠️  Skipping job ${job.id} — title produced empty slug: "${job.title}"`)
                        failed++
                        continue
                  }

                  const slug = await ensureUniqueSlug(base, job.id)

                  await prisma.job.update({
                        where: { id: job.id },
                        data: { slug },
                  })

                  console.log(`  ✅  ${job.id}  →  ${slug}`)
                  updated++
            } catch (err) {
                  console.error(`  ❌  ${job.id}  →  ERROR: ${err.message}`)
                  failed++
            }
      }

      console.log(`\n🎉 Backfill complete: ${updated} updated, ${failed} skipped/failed.`)
}

main()
      .catch((e) => {
            console.error('❌ Backfill script failed:', e.message)
            process.exit(1)
      })
      .finally(() => prisma.$disconnect())
