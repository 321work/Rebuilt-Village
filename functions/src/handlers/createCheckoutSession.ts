import * as functions from 'firebase-functions/v2/https';
import Stripe from 'stripe';
import { z } from 'zod';

const RequestSchema = z.object({
  amount:      z.number().int().min(100).max(10_000_000), // cents ($1–$100k)
  frequency:   z.enum(['once', 'monthly']),
  fundType:    z.enum(['general', 'restricted']).optional().default('general'),
  projectId:   z.string().max(64).optional(),             // e.g. 'summer-camp'
  tributeName: z.string().max(200).optional(),
  successUrl:  z.string().url().optional(),
  cancelUrl:   z.string().url().optional(),
  donorEmail:  z.string().email().optional(),
});

// Human-readable project names for Stripe line items
const PROJECT_LABELS: Record<string, string> = {
  'film-equipment': 'Film Equipment Fund',
  'scholarships':   'Youth Scholarship Fund',
  'summer-camp':    'Summer Camp Launch',
  'film-festival':  'Film Festival 2026',
};

// Map preset amounts (cents) + frequency to pre-created Stripe Price IDs.
// Create these in the Stripe Dashboard and store in Secret Manager.
const PRICE_ID_MAP: Record<string, Record<string, string>> = {
  once: {
    '2500':  process.env.STRIPE_PRICE_ONE_TIME_25   ?? '',
    '5000':  process.env.STRIPE_PRICE_ONE_TIME_50   ?? '',
    '10000': process.env.STRIPE_PRICE_ONE_TIME_100  ?? '',
    '25000': process.env.STRIPE_PRICE_ONE_TIME_250  ?? '',
    '50000': process.env.STRIPE_PRICE_ONE_TIME_500  ?? '',
    '100000': process.env.STRIPE_PRICE_ONE_TIME_1000 ?? '',
  },
  monthly: {
    '2500':  process.env.STRIPE_PRICE_MONTHLY_25   ?? '',
    '5000':  process.env.STRIPE_PRICE_MONTHLY_50   ?? '',
    '10000': process.env.STRIPE_PRICE_MONTHLY_100  ?? '',
    '25000': process.env.STRIPE_PRICE_MONTHLY_250  ?? '',
    '50000': process.env.STRIPE_PRICE_MONTHLY_500  ?? '',
    '100000': process.env.STRIPE_PRICE_MONTHLY_1000 ?? '',
  },
};

export const createCheckoutSession = functions.onRequest(
  {
    cors: [
      'https://rebuiltvillage.org',
      'https://rebuilt-village-prod.web.app',
      ...(process.env.FUNCTIONS_EMULATOR ? ['http://localhost:3000', 'http://localhost:5000'] : []),
    ],
    secrets: ['STRIPE_SECRET_KEY'],
    region: 'us-central1',
    maxInstances: 10,
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const parsed = RequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
      return;
    }

    const { amount, frequency, fundType, projectId, tributeName, donorEmail } = parsed.data;
    const origin     = 'https://rebuiltvillage.org';
    const successUrl = parsed.data.successUrl
      ?? `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}&amount=${amount}&fund_type=${fundType}${projectId ? `&project_id=${projectId}` : ''}`;
    const cancelUrl  = parsed.data.cancelUrl ?? `${origin}/donate?cancelled=true`;

    // Build a readable product name
    const isRestricted   = fundType === 'restricted' && projectId;
    const projectLabel   = isRestricted ? (PROJECT_LABELS[projectId!] ?? 'Restricted Project') : null;
    const productName    = projectLabel
      ? `${projectLabel} — Rebuilt Village`
      : frequency === 'monthly'
      ? 'Monthly Sustainer — Rebuilt Village'
      : 'Donation — Rebuilt Village';

    // Shared metadata for all sessions
    const sharedMeta: Record<string, string> = {
      nonprofit:  'Rebuilt Village',
      ein:        'PENDING',
      frequency,
      fund_type:  fundType ?? 'general',
      ...(projectId    && { project_id:    projectId    }),
      ...(tributeName  && { tribute_name:  tributeName  }),
    };

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2025-02-24.acacia',
    });

    try {
      const priceId = PRICE_ID_MAP[frequency]?.[String(amount)];

      let sessionConfig: Stripe.Checkout.SessionCreateParams;

      if (priceId) {
        // Pre-created Price ID path (preferred — preserves Stripe analytics)
        sessionConfig = {
          mode:         frequency === 'monthly' ? 'subscription' : 'payment',
          line_items:   [{ price: priceId, quantity: 1 }],
          success_url:  successUrl,
          cancel_url:   cancelUrl,
          customer_email: donorEmail,
          automatic_tax: { enabled: false },
          metadata:      sharedMeta,
          payment_method_types: ['card'],
          allow_promotion_codes: true,
          ...(frequency === 'monthly' && {
            subscription_data: { metadata: sharedMeta },
          }),
          ...(frequency === 'once' && {
            payment_intent_data: { metadata: sharedMeta },
          }),
        };
      } else {
        // Ad-hoc price path (custom amounts or missing preset IDs)
        sessionConfig = {
          mode: frequency === 'monthly' ? 'subscription' : 'payment',
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: productName,
                  description:
                    'Supporting film education and community arts in Orlando, FL. ' +
                    'Tax-deductible 501(c)(3) contribution.',
                  images: ['https://rebuiltvillage.org/assets/brand/logo.svg'],
                },
                unit_amount: amount,
                ...(frequency === 'monthly' && { recurring: { interval: 'month' } }),
              },
              quantity: 1,
            },
          ],
          success_url:   successUrl,
          cancel_url:    cancelUrl,
          customer_email: donorEmail,
          allow_promotion_codes: true,
          metadata:      sharedMeta,
          ...(frequency === 'once' && {
            payment_intent_data: { metadata: sharedMeta },
          }),
          ...(frequency === 'monthly' && {
            subscription_data: { metadata: sharedMeta },
          }),
        };
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);
      res.status(200).json({ url: session.url, sessionId: session.id });
    } catch (error) {
      console.error('createCheckoutSession error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }
);
