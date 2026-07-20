type JwtPayload = {
  awx_customer_id?: string
  user_metadata?: {
    awx_customer_id?: string
  }
}

export function getAwxCustomerIdFromAuthHeader(authHeader: string | undefined): string {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header')
  }

  const token = authHeader.slice('Bearer '.length).trim()
  const parts = token.split('.')
  if (parts.length < 2) {
    throw new Error('Malformed JWT')
  }

  const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8')
  let payload: JwtPayload
  try {
    payload = JSON.parse(payloadJson) as JwtPayload
  } catch {
    throw new Error('Malformed JWT payload')
  }

  const customerId =
    payload.awx_customer_id ?? payload.user_metadata?.awx_customer_id

  if (!customerId || typeof customerId !== 'string') {
    throw new Error('awx_customer_id not found in token')
  }

  return customerId
}
