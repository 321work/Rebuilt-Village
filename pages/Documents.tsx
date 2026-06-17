import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { Section } from '../components/Section';
import { FileText, Download, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';
import { Button } from '../components/Button';
import { getDocuments } from '../services/sanityService';

interface Document {
    title: string;
    description: string;
    year: string;
    type: 'tax' | 'financial' | 'governance' | 'annual';
    fileUrl?: string;
    externalUrl?: string;
}

export const Documents: React.FC = () => {
  usePageMeta(
    'Public Documents — Rebuilt Village',
    'Access Rebuilt Village nonprofit public records including our 990 filings, articles of incorporation, grant reports, and bylaws.'
  );
    // Firestore is the source of truth (managed in FireCMS → Documents). These
    // tiles render until the collection loads, and remain the fallback if it is
    // empty or unreachable so the page never goes blank.
    const FALLBACK_DOCUMENTS: Document[] = [
        {
            title: "Internal Revenue Service Form 990 (2024)",
            description: "Annual tax return filed with the IRS showing our financial activities and governance.",
            year: "2024",
            type: "tax",
            fileUrl: "#"
        },
        {
            title: "Internal Revenue Service Form 990 (2023)",
            description: "Previous year tax return for transparency and reference.",
            year: "2023",
            type: "tax",
            fileUrl: "#"
        },
        {
            title: "Annual Production Report 2024",
            description: "Comprehensive overview of our programs, impact, and financial performance.",
            year: "2024",
            type: "annual",
            fileUrl: "#"
        },
        {
            title: "Audited Financial Statements (2024)",
            description: "Independently audited financial statements showing our fiscal responsibility.",
            year: "2024",
            type: "financial",
            fileUrl: "#"
        },
        {
            title: "IRS Determination Letter",
            description: "Official 501(c)(3) tax-exempt status confirmation from the IRS.",
            year: "2023",
            type: "governance",
            fileUrl: "#"
        },
        {
            title: "Organizational Bylaws",
            description: "Governing documents outlining organizational structure and procedures.",
            year: "2024",
            type: "governance",
            fileUrl: "#"
        },
        {
            title: "Conflict of Interest Policy",
            description: "Board and staff policies ensuring ethical governance.",
            year: "2024",
            type: "governance",
            fileUrl: "#"
        },
        {
            title: "Financial Reports (Q4 2024)",
            description: "Quarterly financial summary for donors and stakeholders.",
            year: "2024",
            type: "financial",
            fileUrl: "#"
        }
    ];

    const [documents, setDocuments] = useState<Document[]>(FALLBACK_DOCUMENTS);
    useEffect(() => {
        let cancelled = false;
        getDocuments()
            .then((docs) => {
                if (!cancelled && docs.length > 0) setDocuments(docs);
            })
            .catch(() => {
                /* keep FALLBACK_DOCUMENTS */
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const getTypeColor = (type: Document['type']) => {
        switch (type) {
            case 'tax': return 'text-primary border-primary/30';
            case 'financial': return 'text-[#2DBFA0] border-[#2DBFA040]';
            case 'annual': return 'text-white border-white/30';
            case 'governance': return 'text-slate-400 border-slate-700';
            default: return 'text-slate-500 border-slate-800';
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
                    <div className="font-mono text-[10px] text-primary mb-4 uppercase tracking-[0.4em] font-bold opacity-60">Transparency Record</div>
                    <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-white mb-8">Documents & Archives</h1>
                    <div className="h-1 w-24 bg-primary/30 mx-auto mb-10"></div>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Access our tax returns, financial reports, and governance documents. We believe in radical transparency as a foundation for trust.
                    </p>
                </div>
            </Section>

            <Section bg="black">
                <div className="max-w-6xl mx-auto">

                    {/* Intro Section */}
                    <div className="bg-slate-900/40 border border-slate-800 p-10 md:p-16 mb-20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ShieldCheck size={120} />
                        </div>
                        <div className="relative z-10 max-w-3xl">
                            <h2 className="text-3xl font-serif italic text-white mb-8">The Open Script</h2>
                            <p className="text-slate-400 leading-relaxed mb-10 font-light text-lg">
                                As a 501(c)(3) nonprofit organization, Rebuilt Village is committed to operating with the highest standards of accountability. We make our key documents publicly available so donors, partners, and community members can see exactly how the production is funded.
                            </p>
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="bg-black border border-slate-800 p-6 flex flex-col justify-center">
                                    <div className="font-mono text-[10px] text-primary mb-2 uppercase tracking-widest opacity-60">Tax ID (EIN)</div>
                                    <div className="text-white font-serif italic text-xl">PROCESSED</div>
                                </div>
                                <div className="bg-black border border-slate-800 p-6 flex flex-col justify-center">
                                    <div className="font-mono text-[10px] text-primary mb-2 uppercase tracking-widest opacity-60">Status</div>
                                    <div className="text-white font-serif italic text-xl">501(c)(3) Exempt</div>
                                </div>
                                <div className="bg-black border border-slate-800 p-6 flex flex-col justify-center">
                                    <div className="font-mono text-[10px] text-primary mb-2 uppercase tracking-widest opacity-60">Inaugurated</div>
                                    <div className="text-white font-serif italic text-xl">Est. 2023</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {documents.map((doc, index) => (
                            <div
                                key={index}
                                className="bg-slate-900/40 border border-slate-800 p-8 hover:border-primary transition-all duration-500 group relative"
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex-1">
                                        <div className={`inline-block px-3 py-1 text-[9px] font-mono uppercase tracking-widest mb-4 border ${getTypeColor(doc.type)}`}>
                                            {getTypeLabel(doc.type)}
                                        </div>
                                        <h3 className="text-2xl font-serif italic text-white mb-4 leading-tight group-hover:text-primary transition-colors">
                                            {doc.title}
                                        </h3>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-8 font-light">
                                            {doc.description}
                                        </p>
                                        <div className="flex items-center text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                                            <Calendar size={14} className="mr-2 text-primary/60" />
                                            Record Year: {doc.year}
                                        </div>
                                    </div>
                                    <FileText className="text-slate-800 group-hover:text-primary/20 transition-colors ml-4 shrink-0" size={48} />
                                </div>

                                {/* Download Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-slate-700 hover:border-white h-12"
                                    onClick={() => window.open(doc.fileUrl || doc.externalUrl || '#', '_blank')}
                                >
                                    {doc.externalUrl ? (
                                        <span className="flex items-center"><ExternalLink size={14} className="mr-2" /> View Archive</span>
                                    ) : (
                                        <span className="flex items-center"><Download size={14} className="mr-2" /> Pull Master File</span>
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* External Transparency Sites */}
                    <div className="mt-24 border-t border-slate-900 pt-20">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-serif italic text-white mb-4">Independent Verification</h3>
                            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Third-party transparency platforms</p>
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
                                    className="flex items-center justify-between p-6 bg-slate-900/20 border border-slate-800 hover:border-primary transition-all group"
                                >
                                    <span className="text-slate-300 font-mono text-xs uppercase tracking-widest">{site.name}</span>
                                    <ExternalLink size={14} className="text-slate-700 group-hover:text-primary" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Contact for Questions */}
                    <div className="mt-20 text-center">
                        <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-6">
                            Questions regarding compliance or fiscal oversight?
                        </p>
                        <Button
                            variant="ghost"
                            className="text-primary hover:text-white"
                            onClick={() => window.location.href = 'mailto:info@rebuiltvillage.org'}
                        >
                            Contact Audit Committee
                        </Button>
                    </div>
                </div>
            </Section>
        </>
    );
};
