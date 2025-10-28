import axios from "axios"

/**
 * Axios instance used across the app.
 * baseURL points to backend and already includes '/api' to match server endpoints.
 * Adjust NEXT_PUBLIC_BACKEND_URL in .env if needed (no trailing slash).
 */
const BACKEND = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080").replace(/\/+$/g, "")
const api = axios.create({
  baseURL: `${BACKEND}/api`,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
})

/**
 * Try to resolve an access token.
 * Order:
 *  1) localStorage 'accessToken' (if you store it there)
 *  2) fetch NextAuth session at /api/auth/session (if you use NextAuth)
 *  3) cookie 'next-auth.session-token' fallback (simple parse)
 */
async function resolveToken(): Promise<string | null> {
  try {
    if (typeof window !== "undefined") {
      const fromStorage = localStorage.getItem("accessToken")
      if (fromStorage) return fromStorage

      // try NextAuth session endpoint
      try {
        const r = await fetch("/api/auth/session", { credentials: "include" })
        if (r.ok) {
          const json = await r.json()
          // adapt depending on your NextAuth callbacks (check where you store token)
          const t = json?.accessToken || json?.token || json?.user?.accessToken
          if (t) return t
        }
      } catch (e) {
        // ignore
      }

      // cookie fallback: try to read next-auth cookie (very basic)
      const cookieMatch = document.cookie.match(/(?:^|;\s*)next-auth.session-token=([^;]+)/)
      if (cookieMatch && cookieMatch[1]) return decodeURIComponent(cookieMatch[1])
    }
  } catch (e) {
    // ignore
  }
  return null
}

/**
 * Request interceptor: attach Authorization header when token found.
 */
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await resolveToken()
      if (token) {
        config.headers = config.headers || {}
        // do not override if already present
        if (!config.headers["Authorization"] && !config.headers["authorization"]) {
          config.headers["Authorization"] = `Bearer ${token}`
        }
      }
    } catch (e) {
      // ignore
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * Optional: response interceptor to surface nicer errors (already handled in fetchData)
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // you can log or handle 401 globally here if needed
    return Promise.reject(err)
  }
)

export default api