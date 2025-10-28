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
          // Check multiple possible locations for the token
          const t = json?.accessToken || json?.token || json?.user?.accessToken
          if (t) {
            console.log("Token found in session")
            return t
          } else {
            console.warn("Session found but no accessToken:", Object.keys(json))
          }
        } else {
          console.warn("Failed to fetch session:", r.status)
        }
      } catch (e) {
        console.error("Error fetching session:", e)
      }
    }
  } catch (e) {
    console.error("Error resolving token:", e)
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
          console.log("Token attached to request:", config.url)
        }
      } else {
        console.warn("No token found for request:", config.url)
      }
    } catch (e) {
      console.error("Error attaching token:", e)
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
    if (err.response?.status === 401) {
      console.error("401 Unauthorized:", err.config?.url, err.response?.data)
    }
    if (err.response?.status === 400) {
      console.error("400 Bad Request:", err.config?.url, err.response?.data)
    }
    return Promise.reject(err)
  }
)

export default api