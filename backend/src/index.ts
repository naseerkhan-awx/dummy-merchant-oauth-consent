import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { paymentMethodsRouter } from './routes/paymentMethods.js'

const PORT = Number(process.env.PORT ?? 3001)
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

const app = express()

app.use(
  cors({
    origin: CORS_ORIGIN,
  }),
)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/payment-methods', paymentMethodsRouter)

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
