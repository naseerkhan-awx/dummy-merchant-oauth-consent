import { init, type Payment } from '@airwallex/components-sdk'

const AIRWALLEX_ENV = import.meta.env.VITE_AIRWALLEX_ENV || 'demo'

let initPromise: ReturnType<typeof init> | null = null

export async function initAirwallex() {
  if (!initPromise) {
    initPromise = init({
      env: AIRWALLEX_ENV as 'demo' | 'staging' | 'prod',
      enabledElements: ['payments'],
    })
  }
  return initPromise
}

export async function createCardElement(containerId: string): Promise<Payment.CardElementType> {
  const { payments } = await initAirwallex()
  if (!payments) {
    throw new Error('Airwallex payments module failed to initialize')
  }
  const element = await payments.createElement('card', {
    style: {
      base: {
        color: '#e8eaef',
        fontSize: '16px',
        fontFamily:
          "'Atkinson Hyperlegible', system-ui, -apple-system, sans-serif",
        '::placeholder': {
          color: '#9aa3b5',
        },
      } as unknown as Payment.InputStyle['base'],
      invalid: {
        color: '#ff9b8a',
      },
    },
  })
  if (!element) {
    throw new Error('Failed to create card element')
  }
  element.mount(containerId)
  return element
}
