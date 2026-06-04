// ──────────────────────────────────────────────────────────────────────────────
// POST /api/stripe-webhook — receive Stripe events for completed orders.
//
// Stripe POSTs here when a Checkout Session completes (and other lifecycle
// events you've subscribed to). We:
//   1. Verify the signature against STRIPE_WEBHOOK_SECRET — Stripe signs
//      every request with a hash of the raw body + the timestamp, so we
//      cannot trust the payload until this check passes.
//   2. On `checkout.session.completed`, send the admin a notification email
//      with the order details (artwork, size, address, total).
//   3. Return 200 fast — Stripe retries with exponential backoff on any
//      non-2xx response, so slow handlers cause duplicate emails.
//
// We DO NOT do any fulfillment-system writes here yet (no DB, no inventory).
// The order lives in the Stripe dashboard as the canonical record; the
// email is your notification.
// ──────────────────────────────────────────────────────────────────────────────

export const prerender = false

import type { APIRoute } from 'astro'
import Stripe from 'stripe'
import { stripeServer } from '../../lib/stripe'
import { getStripeWebhookSecret } from '../../lib/env'
import { sendOrderEmail } from '../../lib/order-email'

export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  // CRITICAL: Stripe signs the EXACT raw bytes. Don't .json() the body —
  // that re-serializes through V8 and the signature won't match.
  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripeServer().webhooks.constructEvent(
      rawBody,
      signature,
      getStripeWebhookSecret(),
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[stripe-webhook] signature verification failed', msg)
    return new Response(`Signature verification failed: ${msg}`, { status: 400 })
  }

  // We only care about completed checkouts. Other events (refunds,
  // disputes) can be handled here later; for the MVP we no-op them with
  // a 200 so Stripe stops retrying.
  if (event.type !== 'checkout.session.completed') {
    return new Response('ok', { status: 200 })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const metadata = session.metadata ?? {}
  const artworkTitle = metadata.artworkTitle ?? '(unknown artwork)'
  const artworkUrl = metadata.artworkUrl ?? ''
  const size = metadata.size ?? '(unknown size)'

  const lineItemTotal = session.amount_subtotal ?? 0
  const shippingTotal = session.shipping_cost?.amount_total ?? 0
  const totalCents = session.amount_total ?? lineItemTotal + shippingTotal

  const shipping = session.shipping_details
  const addr = shipping?.address ?? null

  await sendOrderEmail({
    artworkTitle,
    artworkUrl,
    size,
    priceCents: lineItemTotal,
    shippingCents: shippingTotal,
    totalCents,
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
    customerName: shipping?.name ?? session.customer_details?.name ?? null,
    shippingAddress: addr
      ? {
          line1: addr.line1,
          line2: addr.line2,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postal_code,
          country: addr.country,
        }
      : null,
    stripeSessionId: session.id,
  })

  return new Response('ok', { status: 200 })
}
