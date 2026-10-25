import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { getDevelopmentContext } from './shared/services/developmentContext.service.js'
import { boundedAuthHandler } from './app/middleware/auth/boundedAuthHandler.js'
import { requireAdminGateway } from './app/middleware/auth/requireAdminGateway.js'
import productsRoutes from './domains/products/routes/products.routes.js'
import promosRoutes from './domains/promos/routes/promos.routes.js'
import campaignsRoutes from './domains/campaigns/routes/campaigns.routes.js'
import checkoutRoutes from './domains/checkout/routes/checkout.routes.js'
import paymentRoutes from './domains/payments/routes/payment.routes.js'
import ordersRoutes from './domains/orders/routes/orders.routes.js'
import authRoutes from './domains/auth/routes/auth.routes.js'
import customerRecoveryRoutes from './domains/auth/routes/customerRecovery.routes.js'
import accountRoutes from './domains/account/routes/account.routes.js'
import adminCustomersRoutes from './domains/customers/routes/adminCustomers.routes.js'
import adminEmailDeliveryRoutes from './domains/emails/routes/adminEmailDelivery.routes.js'
import adminEmailTemplateRoutes from './domains/emails/routes/adminEmailTemplate.routes.js'
import shippingRoutes from './domains/shipping/routes/shipping.routes.js'
import supportRoutes from './domains/support/routes/support.routes.js'
import storefrontRoutes from './domains/storefront/routes/storefront.routes.js'
import mediaRoutes from './domains/media/routes/media.routes.js'
import {
  customerAuth,
} from './domains/auth/services/customerAuth.service.js'
import { adminAuth } from './domains/auth/services/adminAuth.service.js'
import { getTrustedAuthOrigins } from './config/env.js'
import {
  errorMiddleware,
} from './app/middleware/error.middleware.js'
import {
  customerAuthRateLimiter,
  adminLoginRateLimiter,
} from './app/middleware/security/rateLimit.middleware.js'
import {
  securityHeaders,
} from './app/middleware/security/securityHeaders.middleware.js'

const app = express()

function normalizeOrigin(origin) {
  return String(origin || '')
    .trim()
    .replace(/\/$/, '')
}

const allowedOrigins = new Set(getTrustedAuthOrigins())

app.use(securityHeaders)

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true)
    }

    if (allowedOrigins.has(normalizeOrigin(origin))) {
      return callback(null, true)
    }

    return callback(
      Object.assign(new Error('This request origin is not allowed.'), { statusCode: 403 }),
    )
  },

  credentials: true,
}))

app.use('/api/customer-auth', customerAuthRateLimiter)
app.use('/api/customer-auth', customerRecoveryRoutes)
app.all('/api/customer-auth/*splat', boundedAuthHandler(customerAuth))
app.use('/api/admin-auth', requireAdminGateway)
app.use('/api/admin-auth/sign-in/email', adminLoginRateLimiter)
app.use('/api/admin-auth', customerAuthRateLimiter)
app.all('/api/admin-auth/*splat', (req, res, next) => {
  const path = req.path.slice('/api/admin-auth'.length)
  if (!['/sign-in/email', '/sign-out', '/get-session'].includes(path)) return res.status(404).json({ message: 'Admin authentication endpoint not found.' })
  res.set('Cache-Control', 'no-store')
  return boundedAuthHandler(adminAuth)(req, res, next)
})

app.use(express.json({
  limit: '100kb',
}))
app.use(cookieParser())
app.set('trust proxy', 1)

app.get('/api/health', async (_req, res) => {
  const development = await getDevelopmentContext()
  res.set('Cache-Control', 'no-store')
  res.status(development?.databaseConnected === false ? 503 : 200).json({
    status: development?.databaseConnected === false ? 'UNAVAILABLE' : 'OK',
    message: 'Server is running',
    ...(development ? { development } : {}),
  })
})

app.use('/api/products', productsRoutes)
app.use('/api/checkout', checkoutRoutes)
app.use('/api/checkout', paymentRoutes)
app.use('/api/promos', promosRoutes)
app.use('/api/admin/promos', promosRoutes)
app.use('/api/admin/campaigns', campaignsRoutes)
app.use('/api/campaigns', campaignsRoutes)
app.use('/api/admin/orders', ordersRoutes)
app.use('/api/admin/customers', adminCustomersRoutes)
app.use('/api/admin/notifications', adminEmailDeliveryRoutes)
app.use('/api/admin/email-templates', adminEmailTemplateRoutes)
app.use('/api/account', accountRoutes)
app.use('/api/auth', authRoutes)
app.use('/api', supportRoutes)
app.use('/api', shippingRoutes)
app.use('/api', storefrontRoutes)
app.use('/api', mediaRoutes)
app.use('/api', (_req, res) => res.status(404).json({ success: false, message: 'API endpoint not found.' }))

app.use(errorMiddleware)

export default app
