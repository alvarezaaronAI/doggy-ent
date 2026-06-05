-- Ensure a successful Stripe PaymentIntent can only be attached to one order.
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "public"."Order"("stripePaymentIntentId");
