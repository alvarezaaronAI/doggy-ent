import { createApplicationRouter } from './createApplicationRouter.js'
import { publicRoutes } from './public.routes.js'

export default createApplicationRouter({ routes: publicRoutes })
