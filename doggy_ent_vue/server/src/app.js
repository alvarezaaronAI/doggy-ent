import express from 'express'
import productsRoutes from './routes/products.routes.js'
import adminPromosRoutes from './routes/admin/promos.routes.js'

const app = express()

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.use('/api/products', productsRoutes)
app.use('/api/promos', adminPromosRoutes)
app.use('/api/admin/promos', adminPromosRoutes)

export default app
