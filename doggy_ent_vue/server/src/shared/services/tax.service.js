const DEFAULT_TAX_RATE = 0.08

const STATE_TAX_RATES = {
  CA: 0.095,
  NV: 0.0825,
  AZ: 0.086,
  OR: 0,
  WA: 0.095,
  NY: 0.08875,
  TX: 0.0825,
  FL: 0.07,
}

function normalizeState(state) {
  return String(state || '').trim().toUpperCase()
}

function getTaxRateByState(state) {
  const normalizedState = normalizeState(state)
  return STATE_TAX_RATES[normalizedState] ?? DEFAULT_TAX_RATE
}

function getTaxProvider() {
  // Future-ready hook:
  // local = simple state-based estimate
  // stripe = Stripe Tax integration later
  return process.env.TAX_PROVIDER || 'local'
}

async function calculateLocalTax({ taxableAmount, customer }) {
  const taxRate = getTaxRateByState(customer?.state)
  const taxAmount = Number(taxableAmount || 0) * taxRate

  return {
    provider: 'local',
    taxRate,
    taxAmount,
    jurisdiction: normalizeState(customer?.state) || 'DEFAULT',
    isEstimate: true,
  }
}

async function calculateStripeTax({ taxableAmount, customer }) {
  // Placeholder for future Stripe Tax integration.
  // Later this function can call Stripe using customer address + cart line items.
  return calculateLocalTax({ taxableAmount, customer })
}

export async function calculateTax({ taxableAmount, customer }) {
  const provider = getTaxProvider()

  if (provider === 'stripe') {
    return calculateStripeTax({ taxableAmount, customer })
  }

  return calculateLocalTax({ taxableAmount, customer })
}
