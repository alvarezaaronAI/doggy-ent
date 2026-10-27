import { getPaymentEnvironment, getPublicPaymentConfiguration } from '../services/paymentEnvironment.service.js'
import { getTaxReadiness } from '../../../shared/services/tax.service.js'

export async function getAdminTaxReadiness(_req, res) {
  res.set('Cache-Control', 'no-store')
  try {
    return res.json({ success: true, readiness: await getTaxReadiness() })
  } catch {
    return res.status(503).json({ success: false, message: 'Tax setup could not be checked. Try again.' })
  }
}

export async function getAdminPaymentEnvironment(_req, res) {
  res.set('Cache-Control', 'no-store')
  try {
    return res.json({ success: true, environment: await getPaymentEnvironment() })
  } catch {
    return res.status(503).json({ success: false, message: 'Payment environment could not be checked. Try again.' })
  }
}

export async function getPaymentConfiguration(_req, res) {
  res.set('Cache-Control', 'no-store')
  try {
    return res.json({ success: true, configuration: await getPublicPaymentConfiguration() })
  } catch {
    return res.status(503).json({ success: false, message: 'Secure checkout is temporarily unavailable. Please try again later.' })
  }
}
