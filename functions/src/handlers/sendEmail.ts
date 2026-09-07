import * as functions from 'firebase-functions/v2/https';
import { Resend } from 'resend';
import { z } from 'zod';

const ContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
  formType: z.literal('contact').optional(),
  // Honeypot: bots fill this, humans don't
  website: z.string().max(0).optional(),
});

const NewsletterSchema = z.object({
  email: z.string().email(),
  formType: z.literal('newsletter'),
  website: z.string().max(0).optional(),
});

const BodySchema = z.union([ContactSchema, NewsletterSchema]);

export const sendEmail = functions.onRequest(
  {
    cors: [
      'https://rebuiltvillage.org',
      'https://rebuilt-village-prod.web.app',
      ...(process.env.FUNCTIONS_EMULATOR ? ['http://localhost:3000', 'http://localhost:5000'] : []),
    ],
    secrets: ['RESEND_API_KEY'],
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

    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() });
      return;
    }

    // Honeypot check
    if (parsed.data.website) {
      res.status(200).json({ ok: true }); // Silently succeed to confuse bots
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.FROM_EMAIL ?? 'hello@rebuiltvillage.org';
    const notifyEmail = process.env.DONATION_NOTIFY_EMAIL ?? 'hello@rebuiltvillage.org';

    try {
      if (parsed.data.formType === 'newsletter') {
        // Newsletter subscription
        const { email } = parsed.data;

        await resend.emails.send({
          from: `Rebuilt Village <${fromEmail}>`,
          to: email,
          subject: 'You\'re on The Call Sheet',
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0a; color: #f5f5f0;">
              <img src="https://rebuiltvillage.org/assets/brand/logo.svg" alt="Rebuilt Village" style="width: 160px; margin-bottom: 32px;">
              <h1 style="font-size: 32px; font-style: italic; color: #f5f5f0; margin-bottom: 16px;">You're in.</h1>
              <p style="color: #9a9a8e; font-size: 16px; line-height: 1.7; margin-bottom: 24px;">
                Welcome to <strong style="color: #f5f5f0;">The Call Sheet</strong> — our newsletter for casting calls,
                screening announcements, and community stories from Orlando.
              </p>
              <p style="color: #9a9a8e; font-size: 14px; line-height: 1.7;">
                Expect to hear from us when it matters — never noise.
              </p>
              <hr style="border: none; border-top: 1px solid #2a2a2a; margin: 32px 0;">
              <p style="color: #555; font-size: 12px;">
                Rebuilt Village · 501(c)(3) · Orlando, FL ·
                <a href="https://rebuiltvillage.org/privacy" style="color: #555;">Privacy Policy</a>
              </p>
            </div>
          `,
        });

        // Notify the team
        await resend.emails.send({
          from: `Rebuilt Village <${fromEmail}>`,
          to: notifyEmail,
          subject: `[Newsletter] New subscriber: ${email}`,
          html: `<p>New newsletter subscriber: <strong>${email}</strong></p>`,
        });
      } else {
        // Contact form
        const { name, email, subject, message } = parsed.data as z.infer<typeof ContactSchema>;

        // Notify team
        await resend.emails.send({
          from: `Rebuilt Village Contact Form <${fromEmail}>`,
          to: notifyEmail,
          replyTo: email,
          subject: `[Contact] ${subject} — from ${name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <h2>New Contact Form Submission</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Name</td><td style="padding: 8px;">${name}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Email</td><td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding: 8px; font-weight: bold; background: #f5f5f5;">Subject</td><td style="padding: 8px;">${subject}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; background: #f5f5f5; vertical-align: top;">Message</td><td style="padding: 8px; white-space: pre-wrap;">${message}</td></tr>
              </table>
              <p style="color: #666; font-size: 12px;">Sent via rebuiltvillage.org contact form</p>
            </div>
          `,
        });

        // Auto-reply to sender
        await resend.emails.send({
          from: `Rebuilt Village <${fromEmail}>`,
          to: email,
          subject: 'We received your message',
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0a; color: #f5f5f0;">
              <img src="https://rebuiltvillage.org/assets/brand/logo.svg" alt="Rebuilt Village" style="width: 160px; margin-bottom: 32px;">
              <h1 style="font-size: 28px; font-style: italic; color: #f5f5f0; margin-bottom: 16px;">Message received, ${name}.</h1>
              <p style="color: #9a9a8e; font-size: 16px; line-height: 1.7; margin-bottom: 24px;">
                We'll review your call sheet and get back to you within 2–3 business days.
              </p>
              <p style="color: #9a9a8e; font-size: 14px; line-height: 1.7; font-style: italic;">
                "${message.substring(0, 200)}${message.length > 200 ? '...' : ''}"
              </p>
              <hr style="border: none; border-top: 1px solid #2a2a2a; margin: 32px 0;">
              <p style="color: #555; font-size: 12px;">
                Rebuilt Village · 501(c)(3) · Orlando, FL
              </p>
            </div>
          `,
        });
      }

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('sendEmail error:', error);
      res.status(500).json({ error: 'Email delivery failed' });
    }
  }
);
