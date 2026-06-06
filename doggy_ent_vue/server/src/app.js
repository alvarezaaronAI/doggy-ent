import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import productsRoutes from './domains/products/routes/products.routes.js'
import promosRoutes from './domains/promos/routes/promos.routes.js'
import campaignsRoutes from './domains/campaigns/routes/campaigns.routes.js'
import checkoutRoutes from './domains/checkout/routes/checkout.routes.js'
import paymentRoutes from './domains/payments/routes/payment.routes.js'
import ordersRoutes from './domains/orders/routes/orders.routes.js'
import authRoutes from './domains/auth/routes/auth.routes.js'
import {
  errorMiddleware,
} from './app/middleware/error.middleware.js'

const app = express()

function normalizeOrigin(origin) {
  return String(origin || '')
    .trim()
    .replace(/\/$/, '')
}

function splitOrigins(value) {
  return String(value || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)
}

const allowedOrigins = new Set([
  'http://localhost:5173',
  ...splitOrigins(process.env.FRONTEND_URL),
  ...splitOrigins(process.env.CLIENT_URL),
])

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true)
    }

    if (allowedOrigins.has(normalizeOrigin(origin))) {
      return callback(null, true)
    }

    return callback(
      new Error(
        `CORS blocked for origin: ${origin}`,
      ),
    )
  },

  credentials: true,
}))

app.use(express.json())
app.use(cookieParser())
app.set('trust proxy', 1)

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.use('/api/products', productsRoutes)
app.use('/api/checkout', checkoutRoutes)
app.use('/api/checkout', paymentRoutes)
app.use('/api/promos', promosRoutes)
app.use('/api/admin/promos', promosRoutes)
app.use('/api/admin/campaigns', campaignsRoutes)
app.use('/api/campaigns', campaignsRoutes)
app.use('/api/admin/orders', ordersRoutes)
app.use('/api/auth', authRoutes)

app.use(errorMiddleware)

export default app
