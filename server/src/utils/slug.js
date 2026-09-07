/**
 * slug.js — Slug generation and uniqueness utilities for Rojgar AI
 */

/**
 * Generate a URL-safe slug from a title.
 * "Bank of Baroda LBO Recruitment 2026" → "bank-of-baroda-lbo-recruitment-2026"
 */
export function generateSlug(title) {
      return title
            .toString()
            .toLowerCase()
            .trim()
            // Replace & with 'and'
            .replace(/&/g, 'and')
            // Replace spaces and underscores with hyphens
            .replace(/[\s_]+/g, '-')
            // Remove all characters that are not alphanumeric or hyphens
            .replace(/[^a-z0-9-]/g, '')
            // Remove duplicate hyphens
            .replace(/-{2,}/g, '-')
            // Trim hyphens from start and end
            .replace(/^-+|-+$/g, '')
}

/**
 * Ensure the slug is unique in the Job table.
 * If "bank-of-baroda-lbo-recruitment-2026" exists, returns
 * "bank-of-baroda-lbo-recruitment-2026-2", then "-3", etc.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} baseSlug  — the slug generated from the title
 * @param {string|null} excludeId — the job ID to exclude (for update operations)
 * @returns {Promise<string>} a unique slug
 */
export async function ensureUniqueSlug(prisma, baseSlug, excludeId = null) {
      let slug = baseSlug
      let suffix = 2

      // eslint-disable-next-line no-constant-condition
      while (true) {
            const existing = await prisma.job.findUnique({
                  where: { slug },
                  select: { id: true },
            })

            // No conflict, or the conflict is the post being updated itself
            if (!existing || existing.id === excludeId) {
                  return slug
            }

            // Try the next suffix
            slug = `${baseSlug}-${suffix}`
            suffix++
      }
}
