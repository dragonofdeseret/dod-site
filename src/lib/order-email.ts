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

    // Library-aesthetic email. Parchment background, deep-ink text,
    // Marcellus headings, small-caps kickers, oxblood "Total" line.
    // Renders cleanly in Apple Mail, Gmail, and most clients that
    // respect inline CSS. Width capped at 560 for handheld inboxes.
    const html = `
<div style="background: #ece2c5; padding: 32px 16px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: rgba(224, 212, 177, 0.6); border: 1px solid #c9b88f; border-radius: 10px; padding: 36px 40px; font-family: Baskerville, Georgia, 'Times New Roman', serif; color: #1f1a10; line-height: 1.5;">

    <div style="font-family: 'Marcellus', Georgia, serif; font-variant: small-caps; letter-spacing: 0.14em; font-size: 11px; color: #6b2820; margin-bottom: 4px;">
      New print order
    </div>
    <h1 style="font-family: 'Marcellus', Georgia, serif; font-size: 26px; margin: 0 0 6px 0; color: #1f1a10; font-weight: 400; letter-spacing: 0.01em;">
      ${escapeHtml(input.artworkTitle)}
    </h1>
    <div style="font-family: 'Marcellus', Georgia, serif; font-size: 15px; color: #5a4d33; margin-bottom: 24px;">
      ${escapeHtml(input.size)} · signed archival print
    </div>

    <table role="presentation" style="border-collapse: collapse; width: 100%; margin: 0 0 28px 0; font-size: 14px;">
      <tr>
        <td style="padding: 6px 0; color: #5a4d33; font-variant: small-caps; letter-spacing: 0.08em; font-size: 12px;">Print</td>
        <td style="padding: 6px 0; text-align: right; color: #1f1a10;">${formatCents(input.priceCents)}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #5a4d33; font-variant: small-caps; letter-spacing: 0.08em; font-size: 12px;">Shipping</td>
        <td style="padding: 6px 0; text-align: right; color: #1f1a10;">${formatCents(input.shippingCents)}</td>
      </tr>
      <tr>
        <td style="padding: 14px 0 6px 0; border-top: 1px solid #c9b88f; font-family: 'Marcellus', Georgia, serif; font-size: 13px; color: #6b2820; letter-spacing: 0.04em;">TOTAL</td>
        <td style="padding: 14px 0 6px 0; border-top: 1px solid #c9b88f; text-align: right; font-family: 'Marcellus', Georgia, serif; font-size: 17px; color: #6b2820;">${formatCents(input.totalCents)}</td>
      </tr>
    </table>

    <div style="font-family: 'Marcellus', Georgia, serif; font-variant: small-caps; letter-spacing: 0.12em; font-size: 11px; color: #8a7d5d; margin-bottom: 8px;">
      Ship to
    </div>
    <div style="margin-bottom: 20px;">
      <div style="font-size: 15px; color: #1f1a10; margin-bottom: 4px;">${escapeHtml(input.customerName ?? '(no name on file)')}</div>
      ${addressLines.map((ln) => `<div style="font-size: 14px; color: #5a4d33; line-height: 1.4;">${escapeHtml(String(ln))}</div>`).join('')}
    </div>

    <div style="margin: 24px 0 0 0;">
      <a href="${escapeHtml(input.artworkUrl)}" style="display: inline-block; padding: 10px 22px; background: #1f1a10; color: #ece2c5; text-decoration: none; border-radius: 999px; font-family: 'Marcellus', Georgia, serif; font-size: 13px; letter-spacing: 0.06em;">View artwork</a>
    </div>

    <hr style="margin: 28px 0 16px 0; border: 0; border-top: 1px solid rgba(168, 149, 106, 0.5);" />
    <div style="font-size: 11px; color: #8a7d5d; line-height: 1.6; font-family: 'IBM Plex Mono', 'SF Mono', Menlo, monospace;">
      <div>Customer · ${escapeHtml(input.customerEmail ?? '(unknown)')}</div>
      <div>Stripe session · ${escapeHtml(input.stripeSessionId)}</div>
    </div>
  </div>
  <div style="text-align: center; font-size: 11px; color: #8a7d5d; margin-top: 16px; font-family: 'Marcellus', Georgia, serif; font-variant: small-caps; letter-spacing: 0.12em;">
    The Dragon of Deseret
  </div>
</div>`

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
