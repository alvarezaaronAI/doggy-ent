import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import productsRoutes from './domains/products/routes/products.routes.js'
import adminPromosRoutes from './domains/admin/routes/promos.routes.js'
import campaignsRoutes from './domains/campaigns/routes/campaigns.routes.js'
import checkoutRoutes from './domains/checkout/routes/checkout.routes.js'
import paymentRoutes from './domains/payments/routes/payment.routes.js'
import ordersRoutes from './domains/orders/routes/orders.routes.js'
import authRoutes from './domains/auth/routes/auth.routes.js'

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true)
    }

    if (allowedOrigins.includes(origin)) {
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
app.use('/api/promos', adminPromosRoutes)
app.use('/api/admin/promos', adminPromosRoutes)
app.use('/api/admin/campaigns', campaignsRoutes)
app.use('/api/campaigns', campaignsRoutes)
app.use('/api/admin/orders', ordersRoutes)
app.use('/api/auth', authRoutes)

export default app