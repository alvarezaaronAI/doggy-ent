import express from 'express'
import productsRoutes from './routes/products.routes.js'

const app = express()

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.use('/api/products', productsRoutes)

export default app
