import { motion, useReducedMotion } from 'framer-motion';
import { Check, Mail, MapPin, Send } from 'lucide-react';
import React, { useState } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { Section } from '../components/Section';

// ─── Subject options ──────────────────────────────────────────────────────────

const SUBJECTS = [
  { value: 'General Inquiry',         label: 'General Inquiry'         },
  { value: 'Program Enrollment',      label: 'Program Enrollment'      },
  { value: 'Summer Camp Application', label: 'Summer Camp Application' },
  { value: 'Volunteering',            label: 'Volunteering'            },
  { value: 'Partnership / Sponsorship', label: 'Partnership / Sponsorship' },
  { value: 'Equipment Donation',      label: 'Equipment Donation'      },
  { value: 'Press & Media',           label: 'Press & Media'           },
  { value: 'Employer Matching',       label: 'Employer Matching'       },
] as const;

// ─── Info cards ───────────────────────────────────────────────────────────────

const INFO_CARDS = [
  {
    icon: <Mail size={18} />,
    heading: 'Email',
    value: 'hello@rebuiltvillage.org',
    href: 'mailto:hello@rebuiltvillage.org',
    note: 'Response within one business day',
  },
  {
    icon: <MapPin size={18} />,
    heading: 'Location',
    value: 'Orlando, Florida',
    href: null,
    note: 'Programs at John H. Jackson Community Center',
  },
] as const;

// ─── Contact page ─────────────────────────────────────────────────────────────

export const Contact: React.FC = () => {
  usePageMeta(
    'Contact Us — Rebuilt Village',
    'Get in touch with the Rebuilt Village team. We respond to inquiries about programs, volunteering, partnerships, and donations.'
  );
  const prefersReduced = useReducedMotion();
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState<{
    name: string; email: string; subject: string; message: string;
  }>({
    name:    '',
    email:   '',
    subject: SUBJECTS[0].value as string,
    message: '',
  });

  function update(field: keyof typeof formData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, formType: 'contact' }),
      });
      setStatus(res.ok ? 'success' : 'error');
      if (res.ok) setFormData({ name: '', email: '', subject: SUBJECTS[0].value, message: '' });
    } catch {
      setStatus('error');
    }
  }

  return (
    <article aria-label="Contact Rebuilt Village">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Section bg="black" className="pt-32">
        <div className="text-center">
          <p className="font-mono text-[10px] text-primary mb-4 uppercase tracking-[0.4em] font-bold opacity-60">
            Production Office
          </p>
          <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-text mb-8">
            Contact Us
          </h1>
          <div className="h-1 w-24 bg-primary/30 mx-auto mb-10" />
          <p className="text-xl text-text-muted max-w-xl mx-auto leading-relaxed font-light">
            Questions about programs, partnerships, or how to get involved — we read everything.
          </p>
        </div>
      </Section>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <Section bg="black">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-16">

          {/* ── Info sidebar ───────────────────────────────────────────────── */}
          <aside className="lg:col-span-2 space-y-8" aria-label="Contact information">

            {INFO_CARDS.map(({ icon, heading, value, href, note }) => (
              <motion.div
                key={heading}
                initial={{ opacity: 0, x: prefersReduced ? 0 : -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="border border-border p-6 bg-surface/30"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-primary" aria-hidden="true">{icon}</span>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">{heading}</p>
                </div>
                {href ? (
                  <a
                    href={href}
                    className="font-serif italic text-text text-lg hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="font-serif italic text-text text-lg">{value}</p>
                )}
                <p className="font-mono text-[10px] text-text-muted/60 uppercase tracking-widest mt-2">{note}</p>
              </motion.div>
            ))}

            {/* Subject quick-links */}
            <div className="border border-border p-6 bg-surface/30">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-5">
                Common Topics
              </p>
              <ul className="space-y-3" role="list">
                {SUBJECTS.slice(1, 6).map(({ value, label }) => (
                  <li key={value}>
                    <button
                      onClick={() => setFormData((prev) => ({ ...prev, subject: value }))}
                      className="font-mono text-[10px] uppercase tracking-widest text-text-muted hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary shrink-0" aria-hidden="true" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </aside>

          {/* ── Form ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-border bg-surface/30 p-12 text-center space-y-5"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto">
                  <Check size={24} className="text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-serif italic text-text">Message received.</h3>
                <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest">
                  We'll review your call sheet and respond within one business day.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="font-mono text-[10px] uppercase tracking-widest px-6 py-3 border border-border text-text-muted hover:border-primary hover:text-text transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 mt-4"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="border border-border bg-surface/20 p-10 space-y-8"
                aria-label="Contact form"
                noValidate
              >
                {/* Name + Email */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-name" className="block font-mono text-[10px] text-primary uppercase tracking-widest mb-2">
                      Name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={formData.name}
                      onChange={update('name')}
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-background border border-border text-text focus:border-primary outline-none transition-colors font-light text-sm placeholder:text-text-muted/40"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block font-mono text-[10px] text-primary uppercase tracking-widest mb-2">
                      Email <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={update('email')}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-background border border-border text-text focus:border-primary outline-none transition-colors font-light text-sm placeholder:text-text-muted/40"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="contact-subject" className="block font-mono text-[10px] text-primary uppercase tracking-widest mb-2">
                    Subject
                  </label>
                  <select
                    id="contact-subject"
                    value={formData.subject}
                    onChange={update('subject')}
                    className="w-full px-4 py-3 bg-background border border-border text-text focus:border-primary outline-none transition-colors font-light text-sm appearance-none cursor-pointer"
                  >
                    {SUBJECTS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="contact-message" className="block font-mono text-[10px] text-primary uppercase tracking-widest mb-2">
                    Message <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={update('message')}
                    placeholder="Tell us what's on your mind..."
                    className="w-full px-4 py-3 bg-background border border-border text-text focus:border-primary outline-none transition-colors resize-none font-light text-sm placeholder:text-text-muted/40"
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-8 py-4 bg-primary text-black hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    aria-describedby={status === 'error' ? 'contact-error' : undefined}
                  >
                    {status === 'loading' ? 'Transmitting...' : <>Send Message <Send size={12} /></>}
                  </button>

                  {status === 'error' && (
                    <p
                      id="contact-error"
                      role="alert"
                      className="font-mono text-[10px] text-red-400 uppercase tracking-widest"
                    >
                      Transmission failed — please try again.
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </Section>

    </article>
  );
};
