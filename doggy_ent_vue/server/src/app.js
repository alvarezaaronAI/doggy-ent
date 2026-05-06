import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import productsRoutes from './routes/products.routes.js'
import adminPromosRoutes from './routes/admin/promos.route.js'
import campaignsRoutes from './routes/admin/campaigns.route.js'
import checkoutRoutes from './routes/checkout.routes.js'
import ordersRoutes from './routes/admin/orders.routes.js'
import authRoutes from './routes/auth/auth.routes.js'

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
app.use('/api/promos', adminPromosRoutes)
app.use('/api/admin/promos', adminPromosRoutes)
app.use('/api/admin/campaigns', campaignsRoutes)
app.use('/api/campaigns', campaignsRoutes)
app.use('/api/admin/orders', ordersRoutes)
app.use('/api/auth', authRoutes)

export default app