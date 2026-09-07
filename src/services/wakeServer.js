/**
 * wakeServer.js — Render Free-tier cold-start solution for RozgarGrid AI
 *
 * Render free instances spin down after ~15 minutes of inactivity.
 * The first request after sleep can take 30–50 seconds to respond.
 *
 * Strategy:
 *   1. Hit GET /health on the backend — lightweight, no auth, no DB query.
 *   2. If it responds 200 → server is awake, proceed immediately.
 *   3. If it fails (network error, 502, 503, 504) → server is waking up.
 *      Retry every RETRY_INTERVAL_MS for up to MAX_ATTEMPTS tries.
 *   4. Notify the caller via onWaking() so the UI can show a status message.
 *   5. Resolve when the server responds, or reject after all retries exhausted.
 *
 * The admin token is NEVER touched here.
 */

const HEALTH_URL =
      import.meta.env.VITE_API_URL
            ? `${import.meta.env.VITE_API_URL}/health`
            : 'https://rojgar-ai-server.onrender.com/health'

const MAX_ATTEMPTS = 6    // 6 × 10 s = up to 60 s total wait
const RETRY_INTERVAL_MS = 10_000
const FETCH_TIMEOUT_MS = 9_000  // slightly under the retry interval

/**
 * Ping /health once with a timeout.
 * Returns true if the server replied 200, false otherwise.
 */
async function ping() {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
      try {
            const res = await fetch(HEALTH_URL, {
                  method: 'GET',
                  signal: controller.signal,
                  // No credentials needed — /health is fully public
            })
            return res.ok // true for 200–299
      } catch {
            return false  // network error, timeout, 502/503 from Render proxy
      } finally {
            clearTimeout(timer)
      }
}

/**
 * Wake the Render backend and wait until it responds.
 *
 * @param {object}   [opts]
 * @param {function} [opts.onWaking]   Called (attempt, maxAttempts) when a retry begins.
 *                                     Use to update UI e.g. "Waking server, please wait…"
 * @param {function} [opts.onAwake]    Called when the server responds successfully.
 * @returns {Promise<void>}  Resolves when server is awake.
 *                           Rejects with an Error after max retries.
 */
export async function wakeServer({ onWaking, onAwake } = {}) {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            const ok = await ping()

            if (ok) {
                  onAwake?.()
                  return // server is awake — caller can proceed
            }

            if (attempt < MAX_ATTEMPTS) {
                  // Notify the UI that we're waiting
                  onWaking?.(attempt, MAX_ATTEMPTS)
                  // Wait before the next ping
                  await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL_MS))
            }
      }

      throw new Error(
            'Server is taking too long to wake up. Please wait a moment and try again.'
      )
}
