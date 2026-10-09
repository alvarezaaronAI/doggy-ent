import express from 'express'
import {
  requireAdminAuth,
} from '../../../app/middleware/auth/requireAdminAuth.js'
import {
  requireCustomerAuth,
} from '../../../app/middleware/auth/requireCustomerAuth.js'
import {
  issueRateLimiter,
} from '../../../app/middleware/security/rateLimit.middleware.js'
import {
  addAdminOrderIssueMessageController,
  createCustomerOrderIssueController,
  getCustomerOrderIssueController,
  listAdminInternalIssuesController,
  listAdminOrderIssuesController,
  listCustomerOrderIssuesController,
  updateAdminInternalIssueController,
  updateAdminOrderIssueController,
} from '../controllers/support.controller.js'

const router = express.Router()

router.get(
  '/account/issues',
  requireCustomerAuth,
  listCustomerOrderIssuesController,
)

router.get(
  '/account/issues/:caseNumber',
  requireCustomerAuth,
  getCustomerOrderIssueController,
)

router.post(
  '/account/orders/:reference/issues',
  issueRateLimiter,
  requireCustomerAuth,
  createCustomerOrderIssueController,
)

router.get(
  '/admin/order-issues',
  requireAdminAuth,
  listAdminOrderIssuesController,
)

router.patch(
  '/admin/order-issues/:caseNumber',
  requireAdminAuth,
  updateAdminOrderIssueController,
)

router.post(
  '/admin/order-issues/:caseNumber/messages',
  issueRateLimiter,
  requireAdminAuth,
  addAdminOrderIssueMessageController,
)

router.get(
  '/admin/internal-issues',
  requireAdminAuth,
  listAdminInternalIssuesController,
)

router.patch(
  '/admin/internal-issues/:caseNumber',
  requireAdminAuth,
  updateAdminInternalIssueController,
)

export default router
