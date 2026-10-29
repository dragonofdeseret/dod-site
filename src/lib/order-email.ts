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

    const html = renderOrderEmailHtml(input, addressLines)

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

// ── Email markup ──────────────────────────────────────────────────────────────
// Valence register, as the site (src/styles/global.css): warm off-white
// ground, a card with a hairline border and 10px corners, the system
// typeface, one sapphire accent, uppercase tracked labels, and the primary
// button's hard 2px edge (drawn with a bottom border — box-shadow is
// dropped by many mail clients). Email clients don't support CSS variables
// or stylesheets reliably, so every value is inline, and layout is tables
// (Outlook). Light only: `color-scheme: light` asks clients that would
// auto-darken (Apple Mail, Outlook) to leave the colours as designed.
const C = {
  bg: '#F1F0EB',
  panel: '#FBFBF8',
  border: '#D4D3CC',
  borderSoft: '#E2E1DA',
  text: '#1B1B19',
  muted: '#5E5E58',
  faint: '#676761',
  accent: '#2449B8',
  btnEdge: '#10245F',
}
const SANS = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Helvetica, Arial, sans-serif"
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
const LABEL = `font-family: ${SANS}; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;`

export function renderOrderEmailHtml(input: OrderEmailInput, addressLines: Array<string | null | undefined>): string {
  const row = (label: string, value: string) => `
              <tr>
                <td style="padding: 7px 0; ${LABEL} color: ${C.faint};">${label}</td>
                <td align="right" style="padding: 7px 0; font-family: ${SANS}; font-size: 15px; color: ${C.text};">${value}</td>
              </tr>`
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>New print order</title>
</head>
<body style="margin: 0; padding: 0; background: ${C.bg}; color-scheme: light;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: ${C.bg};">
  <tr>
    <td align="center" style="padding: 32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; background: ${C.panel}; border: 1px solid ${C.border}; border-radius: 10px;">
        <tr>
          <td style="padding: 32px 36px; font-family: ${SANS}; color: ${C.text}; line-height: 1.5;">

            <div style="${LABEL} color: ${C.accent}; margin: 0 0 6px 0;">New print order</div>
            <h1 style="margin: 0 0 6px 0; font-family: ${SANS}; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; color: ${C.text};">${escapeHtml(input.artworkTitle)}</h1>
            <div style="margin: 0 0 24px 0; font-size: 15px; color: ${C.muted};">${escapeHtml(input.size)} · signed archival print</div>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 26px 0;">${row('Print', formatCents(input.priceCents))}${row('Shipping', formatCents(input.shippingCents))}
              <tr>
                <td style="padding: 14px 0 4px 0; border-top: 1px solid ${C.borderSoft}; ${LABEL} color: ${C.text};">Total</td>
                <td align="right" style="padding: 14px 0 4px 0; border-top: 1px solid ${C.borderSoft}; font-family: ${SANS}; font-size: 18px; font-weight: 700; color: ${C.accent};">${formatCents(input.totalCents)}</td>
              </tr>
            </table>

            <div style="${LABEL} color: ${C.faint}; margin: 0 0 8px 0;">Ship to</div>
            <div style="margin: 0 0 24px 0;">
              <div style="font-size: 15px; font-weight: 600; color: ${C.text}; margin: 0 0 3px 0;">${escapeHtml(input.customerName ?? '(no name on file)')}</div>
              ${addressLines.map((ln) => `<div style="font-size: 14px; color: ${C.muted}; line-height: 1.45;">${escapeHtml(String(ln))}</div>`).join('\n              ')}
            </div>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background: ${C.accent}; border: 1.5px solid ${C.btnEdge}; border-bottom-width: 3px; border-radius: 8px;">
                  <a href="${escapeHtml(input.artworkUrl)}" style="display: inline-block; padding: 10px 20px; font-family: ${SANS}; font-size: 14px; font-weight: 600; color: #FFFFFF; text-decoration: none;">View artwork</a>
                </td>
              </tr>
            </table>

            <div style="margin: 28px 0 14px 0; border-top: 1px solid ${C.borderSoft}; font-size: 0; line-height: 0;">&nbsp;</div>
            <div style="font-family: ${MONO}; font-size: 12px; color: ${C.faint}; line-height: 1.6; word-break: break-all;">
              <div>Customer · ${escapeHtml(input.customerEmail ?? '(unknown)')}</div>
              <div>Stripe session · ${escapeHtml(input.stripeSessionId)}</div>
            </div>

          </td>
        </tr>
      </table>
      <div style="margin: 16px 0 0 0; ${LABEL} color: ${C.faint}; text-align: center;">The Dragon of Deseret</div>
    </td>
  </tr>
</table>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
