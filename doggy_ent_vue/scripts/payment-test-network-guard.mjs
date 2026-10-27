import http from 'node:http'
import https from 'node:https'
import net from 'node:net'
import tls from 'node:tls'
import dns from 'node:dns'
import { syncBuiltinESMExports } from 'node:module'

export const blockedNetworkCode = 'OFFLINE_PAYMENT_NETWORK_BLOCKED'
function deny() {
  throw Object.assign(new Error('Network access is disabled for offline payment tests. Mock the provider or persistence boundary.'), { code: blockedNetworkCode })
}

// Test-worker safeguard, not an OS sandbox. Do not include this module in the app.
globalThis.fetch = async () => deny()
for (const module of [http, https]) {
  module.request = deny
  module.get = deny
}
net.connect = deny
net.createConnection = deny
net.Socket.prototype.connect = deny
tls.connect = deny
for (const key of Object.keys(dns)) {
  if (key === 'lookup' || key === 'lookupService' || key.startsWith('resolve') || key === 'reverse') dns[key] = deny
}
for (const key of Object.keys(dns.promises)) {
  if (key === 'lookup' || key === 'lookupService' || key.startsWith('resolve') || key === 'reverse') dns.promises[key] = async () => deny()
}
syncBuiltinESMExports()
