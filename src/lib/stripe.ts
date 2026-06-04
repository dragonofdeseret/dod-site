// ──────────────────────────────────────────────────────────────────────────────
// Stripe server client + helpers.
//
//   • `stripeServer()` returns the singleton Node-SDK instance bound to
//     STRIPE_SECRET_KEY (sk_test_… or sk_live_…). Initialized lazily so
//     the env var only has to resolve when commerce routes actually run.
//   • `shippingOptionFor(size)` returns the inline shipping_options array
//     to attach to a Stripe Checkout Session — flat-mailer rate for small
//     prints, tube rate for large. US-only for now; international can be
//     bolted on later by extending the table.
//   • `formatCents(n)` returns "$40.00" style strings for email/UI.
// ──────────────────────────────────────────────────────────────────────────────

import Stripe from 'stripe'
import { getStripeSecret } from './env'

let cached: Stripe | null = null

export function stripeServer(): Stripe {
  if (!cached) {
    cached = new Stripe(getStripeSecret(), {
      // Pinned API version → no silent breakage when Stripe ships a new
      // default. Bump intentionally when we upgrade.
      apiVersion: '2025-09-30.acacia' as Stripe.LatestApiVersion,
      typescript: true,
      appInfo: {
        name: 'DoD-site',
        url: 'https://dragonofdeseret.com',
      },
    })
  }
  return cached
}

export type PrintSize = '8x10' | '11x14' | '16x20' | '24x30'

/**
 * Per-size US shipping rate. Small prints ship flat; large prints ship
 * in a tube. Values are integer cents (Stripe's canonical unit).
 *
 * To adjust pricing or add international zones, edit the table here —
 * no Stripe dashboard config required because we attach the rates
 * inline on each Checkout Session.
 */
const SHIPPING_TABLE: Record<PrintSize, { amountCents: number; label: string; etaMinDays: number; etaMaxDays: number }> = {
  '8x10':  { amountCents: 800,  label: 'Flat mailer (US)', etaMinDays: 3, etaMaxDays: 7 },
  '11x14': { amountCents: 800,  label: 'Flat mailer (US)', etaMinDays: 3, etaMaxDays: 7 },
  '16x20': { amountCents: 1500, label: 'Tube (US)',        etaMinDays: 4, etaMaxDays: 9 },
  '24x30': { amountCents: 1500, label: 'Tube (US)',        etaMinDays: 4, etaMaxDays: 9 },
}

export function shippingOptionFor(size: PrintSize): Stripe.Checkout.SessionCreateParams.ShippingOption[] {
  const row = SHIPPING_TABLE[size]
  return [
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount: row.amountCents, currency: 'usd' },
        display_name: row.label,
        delivery_estimate: {
          minimum: { unit: 'business_day', value: row.etaMinDays },
          maximum: { unit: 'business_day', value: row.etaMaxDays },
        },
      },
    },
  ]
}

export function formatCents(amountCents: number): string {
  return `$${(amountCents / 100).toFixed(2)}`
}

export const PRINT_SIZES: readonly PrintSize[] = ['8x10', '11x14', '16x20', '24x30'] as const
