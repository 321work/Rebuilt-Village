import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { Section } from '../components/Section';

/**
 * Accessibility Statement — /accessibility
 * WCAG 2.1 AA conformance statement for rebuiltvillage.org
 * Last reviewed: March 2026
 */
export const Accessibility: React.FC = () => {
  usePageMeta(
    'Accessibility Statement — Rebuilt Village',
    'Rebuilt Village is committed to making our website accessible to everyone. Learn about our accessibility policies and how to report issues.'
  );
    return (
        <article aria-labelledby="a11y-heading">

            {/* ── Hero ───────────────────────────────────────────────────────── */}
            <Section bg="black" className="pt-32">
                <div className="text-center">
                    <p className="font-mono text-[10px] text-primary-text mb-4 uppercase tracking-[0.4em] font-bold">
                        Inclusive Design
                    </p>
                    <h1
                        id="a11y-heading"
                        className="text-5xl md:text-7xl font-serif italic tracking-tight text-text mb-8"
                    >
                        Accessibility
                    </h1>
                    <div className="h-1 w-24 bg-primary/30 mx-auto mb-10" />
                    <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-light">
                        Rebuilt Village is committed to making our digital content accessible to everyone,
                        including people with disabilities.
                    </p>
                </div>
            </Section>

            {/* ── Statement body ─────────────────────────────────────────────── */}
            <Section bg="black">
                <div className="max-w-3xl mx-auto prose-like space-y-12">

                    {/* Conformance status */}
                    <div className="border border-border bg-surface/20 p-10">
                        <h2 className="text-2xl font-serif italic text-text mb-4">Conformance Status</h2>
                        <p className="text-text-muted font-light leading-relaxed">
                            We aim to conform to the{' '}
                            <a
                                href="https://www.w3.org/TR/WCAG21/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-text hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
                            >
                                Web Content Accessibility Guidelines (WCAG) 2.1
                            </a>{' '}
                            at Level AA. This site is <strong className="text-text font-semibold">partially conformant</strong> — some
                            content may not yet meet all criteria as we continue to improve.
                        </p>
                    </div>

                    {/* Technical specifications */}
                    <div>
                        <h2 className="text-2xl font-serif italic text-text mb-5">Technical Approach</h2>
                        <div className="space-y-5 text-text-muted font-light leading-relaxed">
                            <p>
                                rebuiltvillage.org relies on the following technologies for conformance with WCAG 2.1:
                                HTML5, CSS3, ARIA, JavaScript (React), and SVG. The site is tested with keyboard-only
                                navigation and is designed to work with screen readers.
                            </p>
                            <p>
                                All interactive elements carry descriptive labels. Decorative images use empty alt
                                attributes or <code className="text-primary-text font-mono text-sm">aria-hidden="true"</code>.
                                Motion animations respect the <code className="text-primary-text font-mono text-sm">prefers-reduced-motion</code>{' '}
                                media query — all translation and scale animations are disabled for users who have
                                enabled that system preference.
                            </p>
                            <p>
                                Foreground/background color contrast meets or exceeds the WCAG AA ratio of 4.5:1
                                for normal text and 3:1 for large text throughout the site. A skip-to-main-content
                                link is available to keyboard users at the top of every page.
                            </p>
                        </div>
                    </div>

                    {/* Known limitations */}
                    <div>
                        <h2 className="text-2xl font-serif italic text-text mb-5">Known Limitations</h2>
                        <div className="space-y-4 text-text-muted font-light leading-relaxed">
                            <p>
                                The following limitations are known and are being actively addressed:
                            </p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                                    <span>
                                        Board and team member headshots currently use a placeholder image. When real headshots
                                        are uploaded through the Sanity CMS, each will include descriptive alt text.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                                    <span>
                                        PDF documents linked from the Documents page are third-party filings and
                                        may not be fully accessible. Contact us for an accessible version.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                                    <span>
                                        Embedded video content does not yet have closed captions. We are working to
                                        add captioned versions ahead of our Summer 2026 launch.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className="border border-dashed border-border bg-surface/10 p-10">
                        <h2 className="text-2xl font-serif italic text-text mb-5">Feedback & Contact</h2>
                        <div className="space-y-4 text-text-muted font-light leading-relaxed">
                            <p>
                                We welcome feedback on the accessibility of this site. If you encounter a barrier
                                or need content in an alternative format, please reach out:
                            </p>
                            <div className="space-y-2 font-mono text-sm">
                                <p>
                                    Email:{' '}
                                    <a
                                        href="mailto:hello@rebuiltvillage.org"
                                        className="text-primary-text hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
                                    >
                                        hello@rebuiltvillage.org
                                    </a>
                                </p>
                                <p className="text-text-muted/60 text-xs uppercase tracking-wider">
                                    We aim to respond to accessibility feedback within 2 business days.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Formal complaint */}
                    <div>
                        <h2 className="text-2xl font-serif italic text-text mb-5">Formal Complaints</h2>
                        <p className="text-text-muted font-light leading-relaxed">
                            If you are not satisfied with our response, you may contact the{' '}
                            <a
                                href="https://www.hhs.gov/civil-rights/filing-a-complaint/index.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-text hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
                            >
                                U.S. Department of Health & Human Services Office for Civil Rights
                            </a>{' '}
                            or your applicable regional authority.
                        </p>
                    </div>

                    {/* Metadata */}
                    <div className="border-t border-border pt-8">
                        <p className="font-mono text-[10px] text-text-muted/40 uppercase tracking-widest">
                            This statement was last reviewed in March 2026.
                        </p>
                    </div>

                </div>
            </Section>

        </article>
    );
};
