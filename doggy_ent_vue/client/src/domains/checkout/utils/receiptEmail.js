export function receiptEmailMessage(status) {
  if (status === 'SENT') return 'Your payment receipt was accepted by our email provider. Check your inbox and spam folder. Shipping updates are sent separately after review.'
  if (status === 'QUEUED') return 'Your payment receipt is queued for email. This page is your receipt too. Our team will review your order before sending any shipping update.'
  if (status === 'PENDING') return 'Your payment receipt is being processed. Delivery is not confirmed yet. Keep this page or your order reference for your records.'
  if (status === 'FAILED') return 'Your payment is confirmed, but we could not confirm the receipt email. Your order is saved. Keep your order reference and contact us for help; do not pay again.'
  if (status === 'MOCKED') return 'This checkout recorded a test receipt only. No email was sent. Your saved receipt is available on this page.'
  return 'Your saved receipt is available on this page. No receipt email has been sent. Shipping and other order updates are reviewed separately by our team.'
}
