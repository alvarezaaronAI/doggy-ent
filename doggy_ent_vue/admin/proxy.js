import { rewrite } from '@vercel/functions'
import { createGatewayPlan } from './runtime/gateway.js'

export default function proxy(request) {
  try {
    const plan = createGatewayPlan(request, process.env)
    if (!plan) return Response.json({ success: false, message: 'API endpoint not found.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
    const response = rewrite(plan.target, { request: { headers: plan.headers } })
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch {
    return Response.json({ success: false, message: 'The admin connection is temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
