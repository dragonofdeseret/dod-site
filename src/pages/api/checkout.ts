// ──────────────────────────────────────────────────────────────────────────────
// POST /api/checkout — create a Stripe Checkout Session for a print order.
//
// Body: { artworkId: string, size: "8x10" | "11x14" | "16x20" | "24x30" }
//
// Looks the artwork up in the content collection, validates it's actually
// flagged forSale and offers the requested size, then creates a Stripe
// Checkout Session with:
//   • Inline line item (artwork name + size, priced from frontmatter)
//   • Inline shipping rate (flat mailer or tube, from shippingOptionFor)
//   • Shipping address collection (US-only for now)
//   • Success/cancel URLs back to this site
//   • Metadata pointing at the artwork so the webhook can reconstruct context
//
// Responds with { url } — the client redirects window.location.href to it.
// No Stripe.js needed in the browser; the redirect path is the simplest
// safe pattern.
// ──────────────────────────────────────────────────────────────────────────────

export const prerender = false

import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import {
  PRINT_SIZES,
  shippingOptionFor,
  stripeServer,
  type PrintSize,
} from '../../lib/stripe'

interface Body {
  artworkId?: string
  size?: string
}

export const POST: APIRoute = async ({ request, url }) => {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return json({ error: 'Body must be JSON' }, 400)
  }

  const { artworkId, size } = body
  if (!artworkId) return json({ error: 'artworkId required' }, 400)
  if (!size || !PRINT_SIZES.includes(size as PrintSize)) {
    return json({ error: `size must be one of ${PRINT_SIZES.join(', ')}` }, 400)
  }
  const printSize = size as PrintSize

  // Locate the artwork. Look across both art + photo collections — the
  // commerce schema is identical and the URL slug doesn't tell us which.
  const candidates = await Promise.all([
    getCollection('art'),
    getCollection('photo'),
  ])
  const all = candidates.flat()
  type Entry = (typeof all)[number]
  const artwork = all.find((e) => {
    const id = (e.data as { id?: string }).id
    return id === artworkId || e.id === artworkId
  }) as Entry | undefined
  if (!artwork) {
    return json({ error: `Artwork "${artworkId}" not found` }, 404)
  }

  const data = artwork.data as {
    title: string
    forSale?: boolean
    type: 'art' | 'photo'
    image?: string
    prints?: Array<{ size: PrintSize; priceCents: number }>
  }
  if (!data.forSale) {
    return json({ error: 'This artwork is not currently for sale.' }, 403)
  }
  const printConfig = data.prints?.find((p) => p.size === printSize)
  if (!printConfig) {
    return json({ error: `Size "${printSize}" not offered for this artwork.` }, 400)
  }

  // IMPORTANT: in Vercel's serverless runtime, `url.origin` resolves
  // to the internal `https://localhost` host the function was invoked
  // with — Stripe would then redirect the buyer to that unreachable
  // URL post-checkout. Vercel preserves the public host on
  // `x-forwarded-host`; fall back to the canonical domain if missing.
  const forwardedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  const origin = forwardedHost && !forwardedHost.startsWith('localhost')
    ? `${forwardedProto}://${forwardedHost}`
    : 'https://dragonofdeseret.com'
  const artworkUrl = `${origin}/${data.type === 'photo' ? 'photography' : 'art'}/${artworkId}`

  const stripe = stripeServer()
  let session
  try {
    session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    // Apple Pay and Google Pay are surfaced automatically when the
    // buyer's device supports them and `card` is enabled.
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: printConfig.priceCents,
          product_data: {
            name: `${data.title} — ${printSize} print`,
            description: `Signed archival print of "${data.title}".`,
            images: data.image
              ? [data.image.startsWith('http') ? data.image : `${origin}/${data.image}`]
              : undefined,
            metadata: {
              artworkId,
              size: printSize,
            },
          },
        },
      },
    ],
    shipping_address_collection: {
      // Start with US-only; extend when international shipping is figured out.
      allowed_countries: ['US'],
    },
    shipping_options: shippingOptionFor(printSize),
    // Surface a billing-address field so Stripe Tax + risk checks have
    // what they need.
    billing_address_collection: 'auto',
    // Where Stripe sends the buyer after success/cancel.
    success_url: `${origin}/checkout/success?sid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel?artwork=${encodeURIComponent(artworkId)}`,
    // Metadata is echoed back on the webhook event so we can reconstruct
    // which artwork was bought without parsing the line item description.
    metadata: {
      artworkId,
      artworkTitle: data.title,
      artworkUrl,
      size: printSize,
    },
    })
  } catch (err) {
    // Surface Stripe-side errors verbatim so the public client shows
    // the real cause instead of a generic 500 page.
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[checkout] Stripe error:', msg, err)
    return json({ error: `Stripe error: ${msg}` }, 500)
  }

  if (!session.url) {
    return json({ error: 'Stripe did not return a checkout URL.' }, 500)
  }
  return json({ url: session.url }, 200)
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}
