// ──────────────────────────────────────────────────────────────────────────────
// Order-notification email — sent to the admin (you) when a print order
// completes through Stripe Checkout. Triggered from the Stripe webhook
// handler, never from a public route.
//
// Uses Resend's HTTP API directly (one fetch call). Same Resend project
// you already configured as the Supabase auth SMTP relay; the API key
// here is the Resend key (re_…), not the SMTP password.
//
// Failures are caught and logged but do NOT throw — a missing
// notification email shouldn't break the webhook response (Stripe
// would retry indefinitely otherwise, and you'd still see the order
// in the Stripe dashboard).
// ──────────────────────────────────────────────────────────────────────────────

import { Resend } from 'resend'
import { getAdminEmail, getResendFrom, getResendKey } from './env'
import { formatCents } from './stripe'

export interface OrderEmailInput {
  artworkTitle: string
  artworkUrl: string
  size: string
  priceCents: number
  shippingCents: number
  totalCents: number
  customerEmail: string | null
  customerName: string | null
  shippingAddress: {
    line1?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postalCode?: string | null
    country?: string | null
  } | null
  stripeSessionId: string
}

export async function sendOrderEmail(input: OrderEmailInput): Promise<void> {
  try {
    const resend = new Resend(getResendKey())
    const to = getAdminEmail()
    const from = getResendFrom()

    const addr = input.shippingAddress
    const addressLines = addr
      ? [
          addr.line1,
          addr.line2,
          [addr.city, addr.state, addr.postalCode].filter(Boolean).join(', '),
          addr.country,
        ].filter(Boolean)
      : ['(no shipping address on file)']

    const html = `
      <div style="font-family: Georgia, serif; max-width: 560px;">
        <h2 style="margin: 0 0 16px 0;">New print order</h2>
        <p style="margin: 0 0 8px 0;"><strong>${escapeHtml(input.artworkTitle)}</strong> — ${escapeHtml(input.size)}</p>
        <p style="margin: 0 0 16px 0;">
          <a href="${escapeHtml(input.artworkUrl)}">View artwork on site</a>
        </p>
        <table style="border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 4px 12px 4px 0; color: #666;">Print</td><td style="padding: 4px 0;">${formatCents(input.priceCents)}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #666;">Shipping</td><td style="padding: 4px 0;">${formatCents(input.shippingCents)}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #666; font-weight: 600;">Total</td><td style="padding: 4px 0; font-weight: 600;">${formatCents(input.totalCents)}</td></tr>
        </table>
        <h3 style="margin: 20px 0 8px 0; font-size: 14px;">Ship to</h3>
        <p style="margin: 0 0 4px 0;">${escapeHtml(input.customerName ?? '(no name)')}</p>
        ${addressLines.map((ln) => `<p style="margin: 0;">${escapeHtml(String(ln))}</p>`).join('')}
        <p style="margin: 12px 0 0 0; color: #666; font-size: 13px;">
          Customer email: ${escapeHtml(input.customerEmail ?? '(unknown)')}<br />
          Stripe session: <code>${escapeHtml(input.stripeSessionId)}</code>
        </p>
      </div>
    `

    await resend.emails.send({
      from,
      to,
      subject: `Print order — ${input.artworkTitle} (${input.size})`,
      html,
    })
  } catch (err) {
    // Don't throw — see file header.
    console.error('[order-email] failed to send', err)
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
