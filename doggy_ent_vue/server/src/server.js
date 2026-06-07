import { fileURLToPath } from 'url'
import path from 'path'
import {
  loadServerEnv,
} from './config/env.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

loadServerEnv({
  rootDir: path.resolve(__dirname, '..'),
})

const { default: app } = await import('./app.js')

const PORT = process.env.PORT || 3000

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `Server running on port ${PORT}`,
  )
})
