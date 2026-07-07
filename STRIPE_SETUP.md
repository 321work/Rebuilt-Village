# Stripe Configuration Guide — Rebuilt Village

Complete step-by-step setup for the Stripe donation integration. Follow these
steps in order the first time you configure a new environment (test or live).

---

## 1. Create a Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Use the organizational email: **hello@rebuiltvillage.org**
3. Under **Account settings > Business details**, set:
   - Business type: **Nonprofit**
   - Business name: **Rebuilt Village, Inc.**
   - Tax ID: your EIN (add when received — see `EIN_CHECKLIST.md`)
4. Enable **Nonprofit rate** (1.5% + 30¢ per transaction instead of 2.9%) via
   Stripe's nonprofit application at https://stripe.com/nonprofit

---

## 2. Get API Keys

In the Stripe Dashboard, go to **Developers > API keys**.

| Key | Where to find |
|-----|---------------|
| Publishable key (`pk_test_...` / `pk_live_...`) | Revealed on the API keys page |
| Secret key (`sk_test_...` / `sk_live_...`) | Click "Reveal" — copy immediately |

Store the **Secret key** in GCP Secret Manager (see step 6), never in code.
The **Publishable key** is safe for the frontend `.env.local`.

---

## 3. Create Price IDs in Stripe Dashboard

Navigate to **Product catalog > Add product** and create the following. All are
one-time or recurring "Donation" products. Set:
- **Product name**: as shown below
- **Currency**: USD
- **Pricing model**: Standard pricing

### One-Time Prices

| Product Name | Amount | Type | Environment variable |
|---|---|---|---|
| Donation — $25 | $25.00 | One time | `STRIPE_PRICE_ONE_TIME_25` |
| Donation — $50 | $50.00 | One time | `STRIPE_PRICE_ONE_TIME_50` |
| Donation — $100 | $100.00 | One time | `STRIPE_PRICE_ONE_TIME_100` |
| Donation — $250 | $250.00 | One time | `STRIPE_PRICE_ONE_TIME_250` |
| Donation — $500 | $500.00 | One time | `STRIPE_PRICE_ONE_TIME_500` |
| Donation — $1,000 | $1,000.00 | One time | `STRIPE_PRICE_ONE_TIME_1000` |

### Monthly Recurring Prices

| Product Name | Amount | Type | Environment variable |
|---|---|---|---|
| Monthly Sustainer — $25 | $25.00 | Monthly | `STRIPE_PRICE_MONTHLY_25` |
| Monthly Sustainer — $50 | $50.00 | Monthly | `STRIPE_PRICE_MONTHLY_50` |
| Monthly Sustainer — $100 | $100.00 | Monthly | `STRIPE_PRICE_MONTHLY_100` |
| Monthly Sustainer — $250 | $250.00 | Monthly | `STRIPE_PRICE_MONTHLY_250` |
| Monthly Sustainer — $500 | $500.00 | Monthly | `STRIPE_PRICE_MONTHLY_500` |
| Monthly Sustainer — $1,000 | $1,000.00 | Monthly | `STRIPE_PRICE_MONTHLY_1000` |

After creating each product, copy its **Price ID** (`price_...`) for use in
the next step.

> Note: Custom amounts (not in this list) automatically fall back to the
> ad-hoc price path in `createCheckoutSession.ts` — no Price ID needed.

---

## 4. Store Secrets in GCP Secret Manager

The Cloud Functions read secrets at runtime. Set them with the Firebase CLI:

```bash
# Stripe secret key
firebase functions:secrets:set STRIPE_SECRET_KEY
# Paste: sk_live_... (or sk_test_... for test mode)

# Stripe webhook signing secret (get this after step 5)
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# Paste: whsec_...

# One-time Price IDs
firebase functions:secrets:set STRIPE_PRICE_ONE_TIME_25
firebase functions:secrets:set STRIPE_PRICE_ONE_TIME_50
firebase functions:secrets:set STRIPE_PRICE_ONE_TIME_100
firebase functions:secrets:set STRIPE_PRICE_ONE_TIME_250
firebase functions:secrets:set STRIPE_PRICE_ONE_TIME_500
firebase functions:secrets:set STRIPE_PRICE_ONE_TIME_1000

# Monthly Price IDs
firebase functions:secrets:set STRIPE_PRICE_MONTHLY_25
firebase functions:secrets:set STRIPE_PRICE_MONTHLY_50
firebase functions:secrets:set STRIPE_PRICE_MONTHLY_100
firebase functions:secrets:set STRIPE_PRICE_MONTHLY_250
firebase functions:secrets:set STRIPE_PRICE_MONTHLY_500
firebase functions:secrets:set STRIPE_PRICE_MONTHLY_1000

# EIN (add when received)
firebase functions:secrets:set ORG_EIN
# Paste: XX-XXXXXXX
```

Verify all secrets are set:
```bash
firebase functions:secrets:access STRIPE_SECRET_KEY
```

---

## 5. Set Up the Webhook Endpoint

### Production webhook (Stripe Dashboard)

1. In Stripe Dashboard, go to **Developers > Webhooks > Add endpoint**
2. Endpoint URL:
   ```
   https://us-central1-rebuilt-village-prod.cloudfunctions.net/stripeWebhook
   ```
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. On the endpoint detail page, click **Reveal** under **Signing secret**
6. Copy the `whsec_...` value and store it:
   ```bash
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
   ```

### Test webhook (local emulator)

Use the Stripe CLI to forward events to your local emulator during development:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Log in
stripe login

# Forward to local Cloud Functions emulator
stripe listen --forward-to localhost:5001/rebuilt-village-prod/us-central1/stripeWebhook
```

The CLI will print a `whsec_...` signing secret. Set it in your `.env.local`
for emulator runs (see step 6).

---

## 6. Configure .env.local

Create `.env.local` in the project root (git-ignored — never commit this file):

```bash
# .env.local — local development only

# Stripe (use TEST keys locally — never live keys in .env.local)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Firebase Functions emulator target (optional override)
VITE_FUNCTIONS_BASE_URL=http://localhost:5001/rebuilt-village-prod/us-central1
```

For the Cloud Functions emulator, set runtime config via `.env` in
`functions/` (also git-ignored):

```bash
# functions/.env — emulator runtime secrets
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # from: stripe listen output
STRIPE_PRICE_ONE_TIME_25=price_...
STRIPE_PRICE_ONE_TIME_50=price_...
STRIPE_PRICE_ONE_TIME_100=price_...
STRIPE_PRICE_ONE_TIME_250=price_...
STRIPE_PRICE_ONE_TIME_500=price_...
STRIPE_PRICE_ONE_TIME_1000=price_...
STRIPE_PRICE_MONTHLY_25=price_...
STRIPE_PRICE_MONTHLY_50=price_...
STRIPE_PRICE_MONTHLY_100=price_...
STRIPE_PRICE_MONTHLY_250=price_...
STRIPE_PRICE_MONTHLY_500=price_...
STRIPE_PRICE_MONTHLY_1000=price_...
ORG_EIN=PENDING
```

---

## 7. Test the Integration

### With Stripe CLI (recommended)

```bash
# Terminal 1 — start Firebase emulator
firebase emulators:start --only functions,firestore

# Terminal 2 — forward Stripe events
stripe listen --forward-to localhost:5001/rebuilt-village-prod/us-central1/stripeWebhook

# Terminal 3 — trigger a test event
stripe trigger checkout.session.completed
```

### With Stripe test cards

On the Donate page (http://localhost:3000/donate in dev), use these test cards:

| Scenario | Card number | Expiry | CVC |
|---|---|---|---|
| Successful payment | `4242 4242 4242 4242` | Any future | Any |
| Payment declined | `4000 0000 0000 0002` | Any future | Any |
| 3D Secure required | `4000 0025 0000 3155` | Any future | Any |

Use any valid future date and any 3-digit CVC.

### Verify end-to-end

1. Submit a $25 donation in the browser
2. Stripe Dashboard > Payments — confirm the payment appears
3. Firestore console — confirm `donor_projects/general` document updated
4. Check email inbox for tax receipt (uses Resend — configure `RESEND_API_KEY`)
5. Check `hello@rebuiltvillage.org` for team notification email

---

## 8. Go Live Checklist

- [ ] Switch all Stripe keys from `sk_test_...` / `pk_test_...` to `sk_live_...` / `pk_live_...`
- [ ] Re-create all Price IDs in live mode (test and live mode have separate product catalogs)
- [ ] Update all `firebase functions:secrets:set` calls with live values
- [ ] Confirm webhook endpoint points to production Cloud Function URL
- [ ] Add EIN to `ORG_EIN` secret once received (see `EIN_CHECKLIST.md`)
- [ ] Submit nonprofit rate application at https://stripe.com/nonprofit
- [ ] Enable Stripe Tax if needed (currently `automatic_tax: { enabled: false }`)

---

## References

- Stripe Checkout docs: https://stripe.com/docs/payments/checkout
- Firebase Functions secrets: https://firebase.google.com/docs/functions/config-env
- Stripe CLI: https://stripe.com/docs/stripe-cli
- Stripe nonprofit program: https://stripe.com/nonprofit
