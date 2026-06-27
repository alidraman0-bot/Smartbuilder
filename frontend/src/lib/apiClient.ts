const getVercelBackendUrl = () => {
  if (!process.env.VERCEL_URL) return "http://127.0.0.1:8000";
  const protocol = process.env.VERCEL_URL.includes("localhost") ? "http" : "https";
  return `${protocol}://${process.env.VERCEL_URL}/_/backend`;
};

const API_BASE = typeof window !== "undefined"
  ? ""
  : (process.env.NEXT_PUBLIC_BACKEND_URL || 
     (process.env.VERCEL === "1" ? getVercelBackendUrl() : "http://127.0.0.1:8000"));

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`
    const MAX_RETRIES = 3
    const TIMEOUT = 120000 // Increased for deep research

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const controller = new AbortController()
            const timer = setTimeout(() => controller.abort(), TIMEOUT)

            const res = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                }
            })

            clearTimeout(timer)

            if (!res.ok) {
                const errorBody = await res.text().catch(() => "No error body");
                throw new Error(`API Error ${res.status}: ${errorBody}`);
            }

            return await res.json()

        } catch (error: any) {
            const isLastRetry = i === MAX_RETRIES - 1
            const isTimeout = error.name === 'AbortError';

            if (isLastRetry) {
                console.error(`Backend connection failed for ${url} after ${MAX_RETRIES} attempts. Error:`, error)
                throw error
            }

            const delay = Math.pow(2, i) * 1000;
            console.warn(`Retry ${i + 1} for ${url} in ${delay}ms. Reason: ${isTimeout ? 'Timeout' : error.message}`)
            await new Promise(r => setTimeout(r, delay))
        }
    }

    throw new Error("Backend unavailable after retries")
}
