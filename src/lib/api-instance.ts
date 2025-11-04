import axios from "axios"

/**
 * Axios instance used across the app.
 * baseURL points to backend and already includes '/api' to match server endpoints.
 * Adjust NEXT_PUBLIC_API_URL in .env if needed (no trailing slash).
 */
const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api").replace(/\/+$/g, "")
const api = axios.create({
  baseURL: BACKEND,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
})

/**
 * Resolve access token from localStorage
 */
async function resolveToken(): Promise<string | null> {
  try {
    if (typeof window !== "undefined") {
      // Usa o token do nosso SessionProvider (salvo no localStorage)
      const token = localStorage.getItem("access_token")
      if (token) {
        return token
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
        }
      }
    } catch (e) {
      console.error("Error attaching token:", e)
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * Response interceptor to handle 401 errors
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.error("401 Unauthorized:", err.config?.url)
      // Se receber 401 no browser, limpa sessão e redireciona para login
      if (typeof window !== "undefined") {
        console.warn("Session expired. Redirecting to login...")
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("id_token")
        localStorage.removeItem("expires_at")
        window.location.href = "/login"
      }
    }
    if (err.response?.status === 400) {
      console.error("400 Bad Request:", err.config?.url, err.response?.data)
    }
    return Promise.reject(err)
  }
)

export default api