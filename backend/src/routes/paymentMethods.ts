import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { awxFetch } from '../airwallex.js'
import { getAwxCustomerIdFromAuthHeader } from '../decodeToken.js'

type PaymentMethodItem = {
  id: string
  type?: string
  status?: string
  card?: {
    brand?: string
    last4?: string
    expiry_month?: string
    expiry_year?: string
  }
}

type PaymentMethodsResponse = {
  items?: PaymentMethodItem[]
}

type PaymentConsentResponse = {
  id: string
  client_secret: string
}

export const paymentMethodsRouter = Router()

function customerIdFromRequest(authHeader: string | undefined): string {
  try {
    return getAwxCustomerIdFromAuthHeader(authHeader)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid token'
    const error = new Error(message)
    ;(error as Error & { status: number }).status = 400
    throw error
  }
}

paymentMethodsRouter.get('/', async (req, res) => {
  try {
    const customerId = customerIdFromRequest(req.headers.authorization)
    const data = await awxFetch<PaymentMethodsResponse>(
      `/api/v1/pa/payment_methods?customer_id=${encodeURIComponent(customerId)}&type=card`,
    )

    const cards = (data.items ?? [])
      .filter((item) => item.type === 'card' && item.card)
      .filter((item) => item.status !== 'DISABLED')
      .map((item) => ({
        id: item.id,
        brand: item.card?.brand ?? 'card',
        last4: item.card?.last4 ?? '????',
        expiry_month: item.card?.expiry_month ?? '',
        expiry_year: item.card?.expiry_year ?? '',
      }))

    res.json({ cards })
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : 'Failed to list payment methods'
    res.status(status).json({ error: message })
  }
})

paymentMethodsRouter.post('/setup', async (req, res) => {
  try {
    const customerId = customerIdFromRequest(req.headers.authorization)
    const data = await awxFetch<PaymentConsentResponse>('/api/v1/pa/payment_consents/create', {
      method: 'POST',
      body: {
        customer_id: customerId,
        request_id: randomUUID(),
        next_triggered_by: 'customer',
      },
    })

    res.json({
      consent_id: data.id,
      client_secret: data.client_secret,
    })
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : 'Failed to set up card save'
    res.status(status).json({ error: message })
  }
})
