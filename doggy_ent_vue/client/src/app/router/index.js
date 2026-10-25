import { createApplicationRouter } from './createApplicationRouter.js'
import { publicRoutes } from './public.routes.js'
import { adminRoutes } from './admin.routes.js'

// Keep current hosting functional until the protected admin cutover is verified.
export default createApplicationRouter({ routes: [...publicRoutes, ...adminRoutes] })
