# EIN Update Checklist — Rebuilt Village

When the IRS determination letter arrives with the Employer Identification
Number, update all 5 locations below before re-deploying.

Current placeholder: `PENDING` / `"taxID": ""`

---

## Locations to Update

### 1. `index.html` — Organization JSON-LD structured data

File: `/index.html`

Find the `"taxID"` field in the `EducationalOrganization`/`NGO` JSON-LD block:

```json
"taxID": "",
```

Update to:

```json
"taxID": "XX-XXXXXXX",
```

This surfaces the EIN to search engines and rich-result scrapers.

---

### 2. `functions/src/handlers/stripeWebhook.ts` — Tax receipt emails

File: `/functions/src/handlers/stripeWebhook.ts`

The EIN is read from the `ORG_EIN` environment variable at runtime (line ~37):

```ts
const ein = process.env.ORG_EIN ?? 'Pending — contact hello@rebuiltvillage.org';
```

No code change needed here — just update the GCP Secret Manager secret:

```bash
firebase functions:secrets:set ORG_EIN
# Paste: XX-XXXXXXX
```

Then redeploy functions:

```bash
firebase deploy --only functions
```

The tax receipt emails sent to donors will automatically show the real EIN.

---

### 3. `functions/src/handlers/createCheckoutSession.ts` — Stripe metadata

File: `/functions/src/handlers/createCheckoutSession.ts`

Find the `sharedMeta` object (line ~87):

```ts
const sharedMeta: Record<string, string> = {
  nonprofit:  'Rebuilt Village',
  ein:        'PENDING',
  ...
```

Update to:

```ts
  ein:        'XX-XXXXXXX',
```

This tags all Stripe payment records and subscriptions with the EIN for
accounting and audit purposes.

---

### 4. `pages/FAQ.tsx` — Donor-facing FAQ answer

File: `/pages/FAQ.tsx`

Search for `EIN` or `tax-deductible` in the FAQ page. Update the answer to
the "Are donations tax-deductible?" question to include the EIN explicitly,
for example:

```
"Rebuilt Village, Inc. is a 501(c)(3) organization (EIN: XX-XXXXXXX) and
your contribution is tax-deductible to the full extent permitted by law."
```

---

### 5. `components/Footer.tsx` — Site-wide footer

File: `/components/Footer.tsx`

Search for `501(c)(3)` in the footer. Add the EIN next to it:

```
501(c)(3) · EIN: XX-XXXXXXX
```

This ensures the EIN appears on every page for donor trust and compliance.

---

## After Updating All 5 Locations

1. Run `firebase functions:secrets:set ORG_EIN` with the real EIN
2. Deploy functions: `firebase deploy --only functions`
3. Deploy hosting: `firebase deploy --only hosting` (or push to trigger CI)
4. Verify the tax receipt email shows the correct EIN by triggering a test
   donation with `stripe trigger checkout.session.completed`
5. Verify the FAQ page and Footer show the EIN in the browser
6. Submit the Stripe nonprofit rate application (requires EIN):
   https://stripe.com/nonprofit

---

## IRS Resources

- Check EIN application status: https://www.irs.gov/charities-non-profits/charitable-organizations/exempt-organizations-select-check
- Form SS-4 (EIN application): https://www.irs.gov/forms-pubs/about-form-ss-4
- 501(c)(3) determination timeline: typically 3–6 months after Form 1023 filing
