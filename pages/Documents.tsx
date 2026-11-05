import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { Section } from '../components/Section';
import { FileText, Download, ExternalLink, Calendar, ShieldCheck, Mail } from 'lucide-react';
import { getDocuments } from '../services/sanityService';
import { ORGANIZATION } from '../src/organization';

interface Document {
    _id?: string;
    title: string;
    description: string;
    year: string;
    type: 'tax' | 'financial' | 'governance' | 'annual';
    fileUrl?: string;
    externalUrl?: string;
}

const REQUEST_EMAIL = 'hello@rebuiltvillage.org';

export const Documents: React.FC = () => {
  usePageMeta(
    'Public Documents — Rebuilt Village',
    'Rebuilt Village nonprofit public records: EIN, 501(c)(3) status, and how to request our IRS determination letter and filings.'
  );

    // Firestore is the source of truth (managed in FireCMS → Documents). Only
    // documents that really exist are listed; there is deliberately no
    // placeholder list, because a donor must never see a record that is not
    // available.
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        let cancelled = false;
        getDocuments()
            .then((docs) => {
                if (!cancelled) setDocuments(docs);
            })
            .catch(() => {
                /* leave the list empty; the request panel below explains how to ask */
            })
            .finally(() => {
                if (!cancelled) setLoaded(true);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const getTypeColor = (type: Document['type']) => {
        switch (type) {
            case 'tax': return 'text-primary-text border-primary/40';
            case 'financial': return 'text-text border-text/30';
            case 'annual': return 'text-text border-text/30';
            case 'governance': return 'text-text-muted border-border';
            default: return 'text-text-muted border-border';
        }
    };

    const getTypeLabel = (type: Document['type']) => {
        switch (type) {
            case 'tax': return 'Tax Archive';
            case 'financial': return 'Financial Analysis';
            case 'governance': return 'Legal/Governance';
            case 'annual': return 'Master Report';
            default: return 'Archive';
        }
    };

    return (
        <>
            <Section bg="black" className="pt-32">
                <div className="text-center">
                    <div className="font-mono text-[10px] text-primary-text mb-4 uppercase tracking-[0.4em] font-bold">Transparency Record</div>
                    <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-text mb-8">Documents & Archives</h1>
                    <div className="h-1 w-24 bg-primary/30 mx-auto mb-10"></div>
                    <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-light">
                        Our tax ID, tax-exempt status, and the public records we can share. We believe in open books as a foundation for trust.
                    </p>
                </div>
            </Section>

            <Section bg="black">
                <div className="max-w-6xl mx-auto">

                    {/* Intro Section */}
                    <div className="bg-surface border border-border p-10 md:p-16 mb-20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ShieldCheck size={120} />
                        </div>
                        <div className="relative z-10 max-w-3xl">
                            <h2 className="text-3xl font-serif italic text-text mb-8">The Open Script</h2>
                            <p className="text-text-muted leading-relaxed mb-10 font-light text-lg">
                                As a 501(c)(3) nonprofit organization, Rebuilt Village is committed to operating with accountability. We share our key documents so donors, partners, and community members can see how the production is funded.
                            </p>
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="bg-background border border-border p-6 flex flex-col justify-center">
                                    <div className="font-mono text-[10px] text-primary-text mb-2 uppercase tracking-widest">Tax ID (EIN)</div>
                                    <div className="text-text font-serif italic text-xl">{ORGANIZATION.EIN}</div>
                                </div>
                                <div className="bg-background border border-border p-6 flex flex-col justify-center">
                                    <div className="font-mono text-[10px] text-primary-text mb-2 uppercase tracking-widest">Status</div>
                                    <div className="text-text font-serif italic text-xl">501(c)(3) Exempt</div>
                                </div>
                                <div className="bg-background border border-border p-6 flex flex-col justify-center">
                                    <div className="font-mono text-[10px] text-primary-text mb-2 uppercase tracking-widest">Founded</div>
                                    <div className="text-text font-serif italic text-xl">January 2025</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents Grid: only real records */}
                    {documents.length > 0 && (
                        <div className="grid md:grid-cols-2 gap-8">
                            {documents.map((doc, index) => {
                                const href = doc.fileUrl || doc.externalUrl;
                                return (
                                    <div
                                        key={doc._id ?? index}
                                        className="bg-surface border border-border p-8 hover:border-primary transition-all duration-500 group relative"
                                    >
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="flex-1">
                                                <div className={`inline-block px-3 py-1 text-[9px] font-mono uppercase tracking-widest mb-4 border ${getTypeColor(doc.type)}`}>
                                                    {getTypeLabel(doc.type)}
                                                </div>
                                                <h3 className="text-2xl font-serif italic text-text mb-4 leading-tight">
                                                    {doc.title}
                                                </h3>
                                                {doc.description && (
                                                    <p className="text-text-muted text-sm leading-relaxed mb-8 font-light">
                                                        {doc.description}
                                                    </p>
                                                )}
                                                {doc.year && (
                                                    <div className="flex items-center text-[10px] text-text-muted font-mono uppercase tracking-widest">
                                                        <Calendar size={14} className="mr-2 text-primary-text" />
                                                        Record Year: {doc.year}
                                                    </div>
                                                )}
                                            </div>
                                            <FileText className="text-border group-hover:text-primary/30 transition-colors ml-4 shrink-0" size={48} aria-hidden="true" />
                                        </div>

                                        {/* Only documents with a real file or link get a button. */}
                                        {href && (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex w-full items-center justify-center h-12 border border-border hover:border-text font-mono text-xs font-bold uppercase tracking-widest text-text transition-colors"
                                            >
                                                {doc.fileUrl ? (
                                                    <span className="flex items-center"><Download size={14} className="mr-2" aria-hidden="true" /> Download file<span className="sr-only"> (opens in a new tab)</span></span>
                                                ) : (
                                                    <span className="flex items-center"><ExternalLink size={14} className="mr-2" aria-hidden="true" /> View record<span className="sr-only"> (opens in a new tab)</span></span>
                                                )}
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* No documents posted yet: say so, and say how to ask. */}
                    {loaded && documents.length === 0 && (
                        <div className="border border-dashed border-border bg-surface-highlight p-10 md:p-14 text-center">
                            <FileText className="mx-auto mb-6 text-text-muted" size={36} aria-hidden="true" />
                            <h2 className="text-2xl md:text-3xl font-serif italic text-text mb-4">
                                Documents are available on request
                            </h2>
                            <p className="text-text-muted leading-relaxed max-w-xl mx-auto mb-8">
                                Rebuilt Village is a young organization, founded in January 2025. Our IRS determination letter and public filings are available on request. Email us and we will send them to you.
                            </p>
                            <a
                                href={`mailto:${REQUEST_EMAIL}?subject=${encodeURIComponent('Document request')}`}
                                className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                            >
                                <Mail size={14} aria-hidden="true" /> Request documents
                            </a>
                            <p className="mt-4 text-xs text-text-muted font-mono">{REQUEST_EMAIL}</p>
                        </div>
                    )}

                    {/* External Transparency Sites */}
                    <div className="mt-24 border-t border-border pt-20">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-serif italic text-text mb-4">Independent Verification</h3>
                            <p className="text-text-muted font-mono text-[10px] uppercase tracking-widest">Third-party transparency platforms</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { name: 'GuideStar', url: 'https://www.guidestar.org' },
                                { name: 'Charity Navigator', url: 'https://www.charitynavigator.org' },
                                { name: 'ProPublica', url: 'https://www.propublica.org/nonprofits' }
                            ].map((site) => (
                                <a
                                    key={site.name}
                                    href={site.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-6 bg-surface border border-border hover:border-primary transition-all group"
                                >
                                    <span className="text-text font-mono text-xs uppercase tracking-widest">{site.name}</span>
                                    <ExternalLink size={14} className="text-text-muted group-hover:text-primary-text" aria-hidden="true" />
                                    <span className="sr-only">(opens in a new tab)</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Contact for Questions */}
                    <div className="mt-20 text-center">
                        <p className="text-text-muted font-mono text-[10px] uppercase tracking-widest mb-6">
                            Questions about our finances or governance?
                        </p>
                        <a
                            href={`mailto:${REQUEST_EMAIL}`}
                            className="inline-flex items-center justify-center h-12 px-6 font-mono text-xs font-bold uppercase tracking-widest text-primary-text hover:text-text transition-colors"
                        >
                            Email {REQUEST_EMAIL}
                        </a>
                    </div>
                </div>
            </Section>
        </>
    );
};
