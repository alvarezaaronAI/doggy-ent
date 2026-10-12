export function assertLocalCatalogReset({ databaseUrl, nodeEnv, dataTarget, confirmed }) {
  let host
  try { host = new URL(databaseUrl).hostname } catch { throw new Error('A valid local database target is required.') }
  if (!confirmed || nodeEnv === 'production' || dataTarget !== 'LOCAL'
    || !['localhost', '127.0.0.1', '[::1]'].includes(host)) {
    throw new Error('Catalog reseeding is restricted to confirmed LOCAL development databases. Remote/production targets are never allowed.')
  }
}
