import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import productsRoutes from './domains/products/routes/products.routes.js'
import adminPromosRoutes from './domains/admin/routes/promos.routes.js'
import campaignsRoutes from './domains/admin/routes/campaigns.routes.js'
import checkoutRoutes from './domains/checkout/routes/checkout.routes.js'
import paymentRoutes from './domains/payments/routes/payment.routes.js'
import ordersRoutes from './domains/orders/routes/orders.routes.js'
import authRoutes from './domains/auth/routes/auth.routes.js'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())
app.use(cookieParser())

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