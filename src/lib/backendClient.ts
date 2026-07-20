const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export type SavedCard = {
  id: string
  brand: string
  last4: string
  expiry_month: string
  expiry_year: string
}

export type SetupAddCardResponse = {
  consent_id: string
  client_secret: string
}

async function backendFetch<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  if (!BACKEND_URL) {
    throw new Error('VITE_BACKEND_URL is not configured')
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      typeof data === 'object' && data !== null && 'error' in data
        ? String((data as { error: string }).error)
        : res.statusText
    throw new Error(message)
  }

  return data as T
}

export async function listPaymentMethods(accessToken: string): Promise<SavedCard[]> {
  const data = await backendFetch<{ cards: SavedCard[] }>('/api/payment-methods', accessToken)
  return data.cards ?? []
}

export async function setupAddCard(accessToken: string): Promise<SetupAddCardResponse> {
  return backendFetch<SetupAddCardResponse>('/api/payment-methods/setup', accessToken, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}
