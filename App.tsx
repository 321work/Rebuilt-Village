import { Check } from 'lucide-react';
import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import { Button } from './components/Button';
import { CookieConsentBanner as CookieConsent } from './components/CookieConsent';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useToggle } from './hooks/useToggle';
import { urlFor } from './services/sanityClient';
import { ViewfinderNav } from './src/components/ViewfinderNav';
import { ThemeProvider } from './src/contexts/ThemeContext';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Donate = lazy(() => import('./pages/Donate').then(m => ({ default: m.Donate })));
const DonateSuccess = lazy(() => import('./pages/DonateSuccess').then(m => ({ default: m.DonateSuccess })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const Events = lazy(() => import('./pages/Events').then(m => ({ default: m.Events })));
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const Board = lazy(() => import('./pages/Board').then(m => ({ default: m.Board })));
const Documents = lazy(() => import('./pages/Documents').then(m => ({ default: m.Documents })));
const PostDetail = lazy(() => import('./pages/PostDetail').then(m => ({ default: m.PostDetail })));
const FAQ = lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })));
const ProgramsPage = lazy(() => import('./pages/Programs').then(m => ({ default: m.Programs })));
const ContactPage = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const AccessibilityPage = lazy(() => import('./pages/Accessibility').then(m => ({ default: m.Accessibility })));

import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const StickyDonateBar: React.FC<{ footerRef: React.RefObject<HTMLDivElement> }> = ({ footerRef }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [600, 800], [100, 0]);
  const opacity = useTransform(scrollY, [600, 800], [0, 1]);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [footerRef]);

  if (footerVisible) return null;

  return (
    <motion.div
      style={{ y, opacity }}
      className="fixed bottom-0 left-0 right-0 z-[100] bg-primary text-brand-black px-6 py-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto"
    >
      <div className="flex items-center gap-4">
        <span className="w-2 h-2 rounded-full bg-brand-black animate-pulse" />
        <p className="font-serif italic font-bold">Every frame starts with your gift.</p>
      </div>
      <Link to="/donate">
        <Button size="sm" className="bg-brand-black text-white hover:bg-black w-full sm:w-auto shadow-xl">
          Donate Now
        </Button>
      </Link>
    </motion.div>
  );
};

// ─── Back to Top ─────────────────────────────────────────────────────────────
const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 z-[110] w-10 h-10 rounded-full bg-primary text-brand-black flex items-center justify-center shadow-xl hover:bg-primary/90 transition-colors"
          aria-label="Back to top"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const Programs = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const { getPrograms } = await import('./services/sanityService');
        const data = await getPrograms();
        if (data && data.length > 0) {
          setPrograms(data);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPrograms();
  }, []);

  return (
    <div className="py-20 text-center container mx-auto text-text-muted">
      <div className="flex flex-col items-center mb-16">
        <div className="font-mono text-[10px] text-primary mb-4 uppercase tracking-[0.4em] font-bold opacity-60">Current Season</div>
        <h2 className="text-5xl md:text-6xl font-serif italic tracking-tight text-text">Our Programs</h2>
        <div className="h-1 w-20 bg-primary/30 mt-6 mt-6"></div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto px-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-surface/50 p-8 border border-border animate-pulse h-[500px]">
              <div className="h-72 bg-surface-highlight mb-6"></div>
              <div className="h-4 bg-surface-highlight w-1/4 mb-4"></div>
              <div className="h-8 bg-surface-highlight w-3/4 mb-4"></div>
              <div className="h-4 bg-surface-highlight w-full mb-2"></div>
              <div className="h-4 bg-surface-highlight w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {programs.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto px-4">
              {programs.map((program, idx) => (
                <div key={program._id || idx} className="bg-surface p-8 border border-border text-left group hover:border-primary transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
                  <div
                    className="h-72 bg-black mb-6 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-[1.02]"
                    style={{ backgroundImage: program.image ? `url(${urlFor(program.image).url()})` : `url(https://picsum.photos/seed/${idx}/600/400)` }}
                  ></div>
                  <div className="font-mono text-[10px] text-primary mb-3 uppercase tracking-[0.2em] font-bold">
                    {program.category || 'SCENE 101'}
                  </div>
                  <h3 className="text-3xl font-serif italic mb-4 leading-tight text-text">{program.title}</h3>
                  <p className="text-text-muted mb-8 font-light text-sm leading-relaxed">{program.description}</p>
                  <Button variant="outline" size="sm" className="px-8 border-border hover:border-text transition-all">
                    Project Details
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-xl mx-auto py-20 border border-dashed border-border rounded-lg">
              <p className="text-text-muted font-mono text-xs uppercase tracking-widest mb-4 italic">The script is still being written</p>
              <p className="text-text-muted text-[10px] uppercase tracking-wider">Connect Sanity CMS to feature your classes and workshops here.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Contact placeholder component
// Contact placeholder component
const Contact = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="py-20 container mx-auto px-4 max-w-3xl">
      <h2 className="text-4xl font-serif italic mb-12 text-center text-text">Contact The Studio</h2>

      {status === 'success' ? (
        <div className="bg-green-900/20 border border-green-800 p-10 text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-500 rounded-full p-2 text-white">
              <Check size={32} />
            </div>
          </div>
          <h3 className="text-2xl font-serif text-text">Message Received</h3>
          <p className="text-green-600 dark:text-green-400 font-mono text-sm uppercase tracking-widest">We will review your call sheet shortly.</p>
          <Button variant="outline" onClick={() => setStatus('idle')} className="mt-4">Send Another Message</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-surface p-10 border border-border space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-mono text-primary mb-2 uppercase tracking-widest">Name</label>
              <input
                id="contact-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border text-text focus:border-primary outline-none transition-colors font-serif"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-xs font-mono text-primary mb-2 uppercase tracking-widest">Email</label>
              <input
                id="contact-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border text-text focus:border-primary outline-none transition-colors font-serif"
                placeholder="email@address.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="contact-subject" className="block text-xs font-mono text-primary mb-2 uppercase tracking-widest">Subject</label>
            <select
              id="contact-subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border text-text focus:border-primary outline-none transition-colors font-serif"
            >
              <option>General Inquiry</option>
              <option>Program Enrollment</option>
              <option>Volunteering</option>
              <option>Partnership/Sponsorship</option>
            </select>
          </div>
          <div>
            <label htmlFor="contact-message" className="block text-xs font-mono text-primary mb-2 uppercase tracking-widest">Message</label>
            <textarea
              id="contact-message"
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border text-text focus:border-primary outline-none transition-colors font-serif"
              placeholder="Type your message..."
            ></textarea>
          </div>

          <Button
            className="w-full"
            variant="secondary"
            type="submit"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Transmitting...' : 'Send Message'}
          </Button>

          {status === 'error' && (
            <p className="text-red-500 text-xs font-mono text-center uppercase tracking-widest animate-pulse">
              Transmission Failed. Please try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
};

// Navigation items type
export default function App() {
  const [filmGrainEnabled, toggleFilmGrain] = useToggle(true);
  const footerRef = useRef<HTMLDivElement>(null);

  // Main layout wrapped with accessibility features
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="min-h-screen bg-background text-text transition-colors duration-300 relative">
          <SkipLink />
          <ViewfinderNav />

          <main id="main-content" tabIndex={-1} className="outline-none min-h-screen">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/programs" element={<ProgramsPage />} />
                <Route path="/events" element={<Events />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/donate/success" element={<DonateSuccess />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/blog/:slug" element={<PostDetail />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/board" element={<Board />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/accessibility" element={<AccessibilityPage />} />
              </Routes>
            </Suspense>
          </main>
          <div ref={footerRef}><Footer /></div>
          <StickyDonateBar footerRef={footerRef} />
          <BackToTop />
          <CookieConsent />
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Skip Link component
const SkipLink: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-md transition-all"
  >
    Skip to main content
  </a>
);
