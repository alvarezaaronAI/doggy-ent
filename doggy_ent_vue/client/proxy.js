import { rewrite } from '@vercel/functions'
import { createCustomerGatewayPlan } from './runtime/customerGateway.js'

export default function proxy(request) {
  try {
    const plan = createCustomerGatewayPlan(request, process.env)
    if (!plan) return Response.json({ success: false, message: 'API endpoint not found.' }, { status: 404, headers: { 'Cache-Control': 'private, no-store' } })
    const response = rewrite(plan.target, { request: { headers: plan.headers } })
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  } catch {
    return Response.json({ success: false, message: 'Your account connection is temporarily unavailable. Please try again.' }, { status: 503, headers: { 'Cache-Control': 'private, no-store' } })
  }
}
