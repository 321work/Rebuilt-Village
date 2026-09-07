import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { Section } from '../components/Section';

export const Privacy: React.FC = () => {
  usePageMeta(
    'Privacy Policy — Rebuilt Village',
    'Learn how Rebuilt Village collects, uses, and protects your information. We are committed to privacy and responsible data handling.'
  );
    return (
        <>
            <Section bg="black" className="pt-32 pb-0">
                <div className="text-center">
                    <div className="font-mono text-[10px] text-primary mb-4 uppercase tracking-[0.4em] font-bold opacity-60">Legal Protection</div>
                    <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-white mb-8">Privacy Policy</h1>
                    <div className="h-1 w-24 bg-primary/30 mx-auto mb-10"></div>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Your privacy matters to us. Learn how we collect, use, and protect your information within the Rebuilt Village ecosystem.
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
                            <h2 className="text-white">Introduction</h2>
                            <p>
                                Rebuilt Village ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or participate in our programs.
                            </p>
                            <p>
                                As a 501(c)(3) nonprofit organization, we are committed to transparency and responsible data handling practices.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-white">Information We Collect</h2>

                            <h3 className="text-primary font-mono text-sm uppercase tracking-widest">Personal Information</h3>
                            <p>
                                We may collect personal information that you voluntarily provide to us when you:
                            </p>
                            <ul>
                                <li>Register for our programs</li>
                                <li>Make a donation</li>
                                <li>Subscribe to our newsletter</li>
                                <li>Contact us through our website</li>
                                <li>Attend our events</li>
                            </ul>
                            <p>
                                This information may include: name, email address, phone number, mailing address, payment information, and emergency contact information (for program participants).
                            </p>

                            <h3 className="text-primary font-mono text-sm uppercase tracking-widest">Minor Information</h3>
                            <p>
                                For students participating in our programs, we collect information with parental/guardian consent including: student name, age, grade level, school, parent/guardian contact information, emergency contacts, medical information relevant to program participation, and photo/video release permissions.
                            </p>

                            <h3 className="text-primary font-mono text-sm uppercase tracking-widest">Automatically Collected Information</h3>
                            <p>
                                When you visit our website, we may automatically collect: browser type, operating system, IP address, and interaction data via Google Analytics 4.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-white">How We Use Your Information</h2>
                            <p>
                                We use the information we collect to administer programs, process donations, and communicate with our community. We do not sell or trade your data.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-white">Photo and Video Policy</h2>
                            <p>
                                As a film education nonprofit, we frequently photograph and video our students and programs. We obtain written consent from parents/guardians before photographing or filming minors for promotional or educational purposes.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-white">Contact Us</h2>
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
