import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { Section } from '../components/Section';

export const Terms: React.FC = () => {
  usePageMeta(
    'Terms of Service — Rebuilt Village',
    'The terms and conditions governing your use of the Rebuilt Village website and services.'
  );
    return (
        <>
            <Section bg="black" className="pt-32 pb-0">
                <div className="text-center">
                    <div className="font-mono text-[10px] text-primary mb-4 uppercase tracking-[0.4em] font-bold opacity-60">Production Guidelines</div>
                    <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-white mb-8">Terms of Service</h1>
                    <div className="h-1 w-24 bg-primary/30 mx-auto mb-10"></div>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                        The framework for our collaboration. Terms and conditions for using our website and participating in our programs.
                    </p>
                </div>
            </Section>

            <Section bg="black">
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-invert prose-slate lg:prose-lg font-light leading-relaxed 
                                  prose-headings:font-serif prose-headings:italic prose-headings:font-normal
                                  prose-a:text-primary prose-strong:text-white prose-blockquote:border-primary
                                  prose-blockquote:bg-slate-900/50 prose-blockquote:p-6 prose-blockquote:rounded-lg">

                        <div className="mb-12 border-b border-slate-800 pb-8">
                            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest leading-loose">
                                <strong>Effective Date:</strong> December 15, 2024<br />
                                <strong>Last Updated:</strong> December 15, 2024
                            </p>
                        </div>

                        <section className="mb-12">
                            <h2 className="text-white">Agreement to Terms</h2>
                            <p>
                                By accessing or using the Rebuilt Village website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-white">About Rebuilt Village</h2>
                            <p>
                                Rebuilt Village is a 501(c)(3) nonprofit organization dedicated to empowering youth through film education in Orlando, Florida. Our mission is to provide access to professional filmmaking tools and mentorship.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-white">Use of Website</h2>
                            <h3 className="text-primary font-mono text-sm uppercase tracking-widest">Permitted Use</h3>
                            <p>
                                You may use our website for lawful purposes only. You agree not to:
                            </p>
                            <ul>
                                <li>Violate any applicable laws or regulations</li>
                                <li>Infringe on the rights of others</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Scrape or data mine our website without permission</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-white">Program Participation</h2>
                            <h3 className="text-primary font-mono text-sm uppercase tracking-widest">Enrollment</h3>
                            <p>
                                Enrollment in Rebuilt Village programs requires completion of registration forms and, for minors, parental/guardian consent.
                            </p>
                            <h3 className="text-primary font-mono text-sm uppercase tracking-widest">Equipment Use</h3>
                            <p>
                                Participants will have access to professional filmmaking equipment. Participants and their parents/guardians are responsible for any damage to equipment resulting from misuse or negligence.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-white">Donations</h2>
                            <p>
                                Rebuilt Village is a 501(c)(3) tax-exempt organization. Donations are tax-deductible to the extent allowed by law. All donations are final and non-refundable unless made in error.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-white">Intellectual Property</h2>
                            <h3 className="text-primary font-mono text-sm uppercase tracking-widest">Student Work</h3>
                            <p>
                                Students retain copyright to original films and creative works they produce during our programs. However, students grant Rebuilt Village a non-exclusive license to use student work for promotional and educational purposes.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-white">Contact Information</h2>
                            <div className="bg-slate-900 border border-slate-700 p-8 rounded-lg">
                                <p className="text-slate-300 font-mono text-[10px] uppercase tracking-widest leading-loose">
                                    <strong className="text-white">Rebuilt Village</strong><br />
                                    Orlando, FL<br />
                                    Email: info@rebuiltvillage.org
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </Section>
        </>
    );
};
