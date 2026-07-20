const API_BASE = process.env.AIRWALLEX_API_BASE ?? 'https://api-demo.airwallex.com'
const CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID ?? ''
const API_KEY = process.env.AIRWALLEX_API_KEY ?? ''

let cachedToken: string | null = null
let tokenExpiresAt = 0

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken
  }

  if (!CLIENT_ID || !API_KEY) {
    throw new Error('AIRWALLEX_CLIENT_ID and AIRWALLEX_API_KEY must be set')
  }

  const res = await fetch(`${API_BASE}/api/v1/authentication/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CLIENT_ID,
      'x-api-key': API_KEY,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Airwallex login failed (${res.status}): ${body}`)
  }

  const data = (await res.json()) as { token?: string; expires_at?: string }
  if (!data.token) {
    throw new Error('Airwallex login returned no token')
  }

  cachedToken = data.token
  tokenExpiresAt = data.expires_at
    ? new Date(data.expires_at).getTime() - 60_000
    : Date.now() + 19 * 60_000

  return cachedToken
}

export async function awxFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = await getAccessToken()
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message: string }).message)
        : text || res.statusText
    throw new Error(`Airwallex API error (${res.status}): ${message}`)
  }

  return data as T
}
