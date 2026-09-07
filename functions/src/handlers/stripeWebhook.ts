import * as functions from 'firebase-functions/v2/https';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { db, FieldValue } from '../lib/firebase';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatAmount(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// Human-readable project labels for team notifications + tax receipts
const PROJECT_LABELS: Record<string, string> = {
  'film-equipment-fund':   'Film Equipment Fund',
  'youth-scholarship-fund': 'Youth Scholarship Fund',
  'summer-camp-launch':    'Summer Camp Launch',
  'film-apalooza-2026':    'Film-apalooza at Dr. Phillips',
};

// ─── Tax receipt HTML ─────────────────────────────────────────────────────────

function taxReceiptHtml(params: {
  donorName: string;
  donorEmail: string;
  amount: string;
  frequency: string;
  date: string;
  transactionId: string;
  fundType: string;
  projectLabel?: string;
  tributeName?: string;
}): string {
  const { donorName, amount, frequency, date, transactionId, fundType, projectLabel, tributeName } = params;

  // EIN is injected at runtime via environment variable once the IRS determination arrives.
  // Until then the receipt shows a pending notice; donors can request EIN via contact form.
  const ein = process.env.ORG_EIN ?? 'Pending — contact hello@rebuiltvillage.org';

  const fundLine = fundType === 'restricted' && projectLabel
    ? `Restricted — ${projectLabel}`
    : 'General Operating Fund';

  const tributeLine = tributeName
    ? `<tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #9a9a8e; font-size: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em;">In Honor / Memory Of</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #f5f5f0; text-align: right;">${tributeName}</td>
      </tr>`
    : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a;">
      <div style="font-family: Georgia, serif; max-width: 680px; margin: 0 auto; padding: 48px 32px; background: #0a0a0a; color: #f5f5f0;">

        <img src="https://rebuiltvillage.org/assets/brand/logo.svg" alt="Rebuilt Village" style="width: 180px; margin-bottom: 40px; display: block;">

        <h1 style="font-size: 36px; font-style: italic; font-weight: 400; color: #f5f5f0; margin: 0 0 8px 0; line-height: 1.2;">
          Thank you, ${donorName}.
        </h1>
        <p style="font-size: 14px; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase; color: #9a9a8e; margin: 0 0 40px 0;">
          Official Tax Receipt &mdash; 501(c)(3) Contribution
        </p>

        <div style="background: #141414; border: 1px solid #2a2a2a; padding: 32px; margin-bottom: 40px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #9a9a8e; font-size: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em;">Organization</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #f5f5f0; text-align: right;">Rebuilt Village, Inc.</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #9a9a8e; font-size: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em;">EIN</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #f5f5f0; text-align: right;">${ein}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #9a9a8e; font-size: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em;">Amount</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #f5f5f0; text-align: right; font-size: 20px; font-style: italic;">${amount}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #9a9a8e; font-size: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em;">Fund</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #f5f5f0; text-align: right;">${fundLine}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #9a9a8e; font-size: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em;">Frequency</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #f5f5f0; text-align: right; text-transform: capitalize;">${frequency}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #9a9a8e; font-size: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em;">Date</td>
              <td style="padding: 12px 0; border-bottom: ${tributeName ? '1px solid #2a2a2a' : 'none'}; color: #f5f5f0; text-align: right;">${date}</td>
            </tr>
            ${tributeLine}
            <tr>
              <td style="padding: 12px 0; color: #9a9a8e; font-size: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em;">Transaction ID</td>
              <td style="padding: 12px 0; color: #555; text-align: right; font-size: 11px; font-family: monospace;">${transactionId}</td>
            </tr>
          </table>
        </div>

        <p style="color: #9a9a8e; font-size: 14px; line-height: 1.8; margin-bottom: 24px;">
          Your contribution directly funds film education, equipment access, and mentorship for youth in Orlando, Florida.
          No goods or services were provided in exchange for this donation.
        </p>

        <p style="color: #9a9a8e; font-size: 13px; line-height: 1.7; font-style: italic; border-left: 2px solid #2a2a2a; padding-left: 16px; margin-bottom: 40px;">
          This letter serves as your official tax receipt for contributions to Rebuilt Village, Inc., a 501(c)(3)
          tax-exempt organization. Please retain for your tax records.
        </p>

        <hr style="border: none; border-top: 1px solid #2a2a2a; margin-bottom: 32px;">

        <p style="color: #555; font-size: 11px; line-height: 1.7;">
          Rebuilt Village, Inc. &nbsp;&middot;&nbsp; 501(c)(3) &nbsp;&middot;&nbsp; Orlando, FL<br>
          <a href="https://rebuiltvillage.org" style="color: #555;">rebuiltvillage.org</a> &nbsp;&middot;&nbsp;
          <a href="mailto:hello@rebuiltvillage.org" style="color: #555;">hello@rebuiltvillage.org</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

// ─── Webhook handler ──────────────────────────────────────────────────────────

export const stripeWebhook = functions.onRequest(
  {
    cors: false, // Stripe calls this directly — no CORS needed
    secrets: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'RESEND_API_KEY'],
    region: 'us-central1',
    maxInstances: 10,
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2025-02-24.acacia',
    });

    const sig = req.headers['stripe-signature'];
    if (!sig) {
      res.status(400).send('Missing stripe-signature header');
      return;
    }

    let stripeEvent: Stripe.Event;
    try {
      // req.rawBody is provided by Cloud Functions v2
      stripeEvent = stripe.webhooks.constructEvent(
        (req as functions.Request & { rawBody: Buffer }).rawBody ?? req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET ?? ''
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      res.status(400).send(`Webhook Error: ${(err as Error).message}`);
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY ?? '');
    const fromEmail  = process.env.FROM_EMAIL       ?? 'hello@rebuiltvillage.org';
    const notifyEmail = process.env.DONATION_NOTIFY_EMAIL ?? 'hello@rebuiltvillage.org';

    try {
      switch (stripeEvent.type) {

        case 'checkout.session.completed': {
          const session = stripeEvent.data.object as Stripe.Checkout.Session;
          if (session.payment_status !== 'paid') break;

          const donorEmail   = session.customer_details?.email ?? session.customer_email ?? '';
          const donorName    = session.customer_details?.name ?? 'Friend';
          const amountTotal  = session.amount_total ?? 0;
          const frequency    = (session.metadata?.frequency ?? 'once') as string;
          const fundType     = (session.metadata?.fund_type  ?? 'general') as string;
          const projectId    = session.metadata?.project_id  ?? null;
          const tributeName  = session.metadata?.tribute_name ?? null;
          const projectLabel = projectId ? (PROJECT_LABELS[projectId] ?? projectId) : undefined;
          const date = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          });

          // ── 1. Firestore: increment restricted project raised amount ───────
          if (fundType === 'restricted' && projectId && amountTotal > 0) {
            try {
              await db.collection('donor_projects').doc(projectId).set(
                {
                  raised:           FieldValue.increment(amountTotal),
                  donationCount:    FieldValue.increment(1),
                  lastDonationAt:   FieldValue.serverTimestamp(),
                },
                { merge: true } // create doc if it doesn't exist
              );
              console.log(`Incremented donor_projects/${projectId} by ${amountTotal} cents`);
            } catch (firestoreErr) {
              // Log but do not fail the webhook — email delivery is more critical
              console.error('Firestore increment failed:', firestoreErr);
            }
          }

          // ── 2. Tax receipt to donor ───────────────────────────────────────
          if (donorEmail) {
            await resend.emails.send({
              from: `Rebuilt Village <${fromEmail}>`,
              to: donorEmail,
              subject: `Your ${formatAmount(amountTotal)} donation receipt — Rebuilt Village`,
              html: taxReceiptHtml({
                donorName,
                donorEmail,
                amount: formatAmount(amountTotal),
                frequency,
                date,
                transactionId: session.id,
                fundType,
                projectLabel,
                tributeName: tributeName ?? undefined,
              }),
            });
          }

          // ── 3. Team notification ──────────────────────────────────────────
          const fundLine = fundType === 'restricted' && projectLabel
            ? `Restricted &rarr; <strong>${projectLabel}</strong>`
            : 'General Operating Fund';

          await resend.emails.send({
            from: `Rebuilt Village <${fromEmail}>`,
            to: notifyEmail,
            subject: `[Donation] ${formatAmount(amountTotal)} ${frequency} — ${donorName}${projectLabel ? ` · ${projectLabel}` : ''}`,
            html: `
              <div style="font-family: monospace; max-width: 520px; margin: 0 auto; padding: 32px; background: #0a0a0a; color: #f5f5f0; border: 1px solid #2a2a2a;">
                <p style="color: #E5A916; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 20px 0;">New Donation · Rebuilt Village</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr><td style="color: #9a9a8e; padding: 8px 0; border-bottom: 1px solid #1a1a1a;">Donor</td><td style="color: #f5f5f0; text-align: right; padding: 8px 0; border-bottom: 1px solid #1a1a1a;">${donorName} (${donorEmail})</td></tr>
                  <tr><td style="color: #9a9a8e; padding: 8px 0; border-bottom: 1px solid #1a1a1a;">Amount</td><td style="color: #f5f5f0; text-align: right; padding: 8px 0; border-bottom: 1px solid #1a1a1a;"><strong>${formatAmount(amountTotal)}</strong></td></tr>
                  <tr><td style="color: #9a9a8e; padding: 8px 0; border-bottom: 1px solid #1a1a1a;">Frequency</td><td style="color: #f5f5f0; text-align: right; padding: 8px 0; border-bottom: 1px solid #1a1a1a; text-transform: capitalize;">${frequency}</td></tr>
                  <tr><td style="color: #9a9a8e; padding: 8px 0; border-bottom: 1px solid #1a1a1a;">Fund</td><td style="color: #f5f5f0; text-align: right; padding: 8px 0; border-bottom: 1px solid #1a1a1a;">${fundLine}</td></tr>
                  ${tributeName ? `<tr><td style="color: #9a9a8e; padding: 8px 0; border-bottom: 1px solid #1a1a1a;">Tribute</td><td style="color: #f5f5f0; text-align: right; padding: 8px 0; border-bottom: 1px solid #1a1a1a;">${tributeName}</td></tr>` : ''}
                  <tr><td style="color: #9a9a8e; padding: 8px 0;">Session ID</td><td style="color: #555; text-align: right; padding: 8px 0; font-size: 11px;">${session.id}</td></tr>
                </table>
                <p style="margin-top: 24px; font-size: 12px;">
                  <a href="https://dashboard.stripe.com/payments/${session.payment_intent}" style="color: #E5A916;">View in Stripe &rarr;</a>
                </p>
              </div>
            `,
          });

          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = stripeEvent.data.object as Stripe.Subscription;
          console.log('Subscription cancelled:', subscription.id);
          // TODO Phase 6: sync to Sanity donor record, remove from mailing list
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = stripeEvent.data.object as Stripe.Invoice;
          const customerEmail = invoice.customer_email;
          if (customerEmail) {
            await resend.emails.send({
              from: `Rebuilt Village <${fromEmail}>`,
              to: customerEmail,
              subject: 'Action needed: Your monthly gift couldn\'t be processed',
              html: `
                <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #0a0a0a; color: #f5f5f0;">
                  <h1 style="font-style: italic; font-size: 24px;">A quick note about your monthly gift</h1>
                  <p style="color: #9a9a8e; line-height: 1.7;">
                    We tried to process your monthly donation but encountered an issue with your payment method.
                    No worries — these things happen. Please update your payment details to keep supporting Rebuilt Village.
                  </p>
                  <a href="https://rebuiltvillage.org/donate" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #f5f5f0; color: #0a0a0a; text-decoration: none; font-family: monospace; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;">
                    Update Payment Method
                  </a>
                </div>
              `,
            });
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${stripeEvent.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);
