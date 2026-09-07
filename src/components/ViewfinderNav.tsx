import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Heart, Menu, Monitor, Moon, Sun, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { announceToScreenReader, trapFocus } from '../utils/a11y';

// ─── Nav link definitions ────────────────────────────────────────────────────
const NAV_LINKS = [
  { path: '/about',    label: 'About'    },
  { path: '/programs', label: 'Programs' },
  { path: '/events',   label: 'Events'   },
  { path: '/blog',     label: 'Blog'     },
  { path: '/contact',  label: 'Contact'  },
] as const;

// ─── Cinematic viewfinder cursor ─────────────────────────────────────────────
const ViewfinderCursor: React.FC = () => {
  const [pos, setPos]           = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const prefersReduced          = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [prefersReduced]);

  useEffect(() => {
    if (prefersReduced) return;
    const addListeners = () => {
      document.querySelectorAll('a, button, [role="button"]').forEach(el => {
        el.addEventListener('mouseenter', () => setHovering(true));
        el.addEventListener('mouseleave', () => setHovering(false));
      });
    };
    addListeners();
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [prefersReduced]);

  if (prefersReduced) return null;

  const size = hovering ? 52 : 30;
  const half = size / 2;

  return (
    <div
      className="fixed pointer-events-none z-[9998] hidden md:block"
      style={{
        left: pos.x - half,
        top: pos.y - half,
        width: size,
        height: size,
        transition: 'width 0.15s ease, height 0.15s ease, left 0.04s linear, top 0.04s linear',
      }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 rounded-full border border-brand-gold/50"
        style={{ opacity: hovering ? 0.85 : 0.4, transition: 'opacity 0.15s ease' }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px bg-brand-gold/50" style={{ height: '28%' }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px bg-brand-gold/50" style={{ height: '28%' }} />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-brand-gold/50" style={{ width: '28%' }} />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-px bg-brand-gold/50" style={{ width: '28%' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-brand-gold" />
    </div>
  );
};

// ─── Compact theme toggle ─────────────────────────────────────────────────────
const CompactThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light'  as const, icon: <Sun     size={12} />, label: 'Light mode'  },
    { value: 'dark'   as const, icon: <Moon    size={12} />, label: 'Dark mode'   },
    { value: 'system' as const, icon: <Monitor size={12} />, label: 'System theme'},
  ];

  return (
    <div
      className="flex items-center gap-0.5 bg-surface border border-border rounded-full px-1 py-1"
      role="group"
      aria-label="Select color theme"
    >
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          aria-pressed={theme === opt.value}
          aria-label={opt.label}
          title={opt.label}
          className={[
            'w-6 h-6 flex items-center justify-center rounded-full',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/60',
            theme === opt.value
              ? 'bg-primary text-primary-foreground'
              : 'text-text-muted hover:text-text',
          ].join(' ')}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
};

// ─── Mobile full-screen drawer ────────────────────────────────────────────────
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

const MobileDrawer: React.FC<DrawerProps> = ({ isOpen, onClose, currentPath }) => {
  const drawerRef   = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (isOpen && drawerRef.current) {
      trapFocus(drawerRef.current);
      const first = drawerRef.current.querySelector<HTMLElement>('a, button');
      first?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.22 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200]"
            aria-hidden="true"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            ref={drawerRef}
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: prefersReduced ? 0 : 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 h-full w-80 max-w-[88vw] bg-brand-black border-l border-primary/20 z-[201] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <Link
                to="/"
                onClick={onClose}
                className="focus:outline-none focus:ring-2 focus:ring-primary/60 rounded"
                aria-label="Go to homepage"
              >
                <span className="font-display text-base font-semibold text-primary tracking-[0.15em] uppercase">
                  Rebuilt Village
                </span>
              </Link>
              <button
                onClick={onClose}
                aria-label="Close navigation menu"
                className="p-2 text-text-muted hover:text-text transition-colors focus:outline-none focus:ring-2 focus:ring-primary/60 rounded"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Nav links */}
            <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto py-6 px-4">
              <ul className="space-y-0.5" role="list">
                {/* Home link in mobile */}
                {[{ path: '/', label: 'Home' }, ...NAV_LINKS].map((link, i) => {
                  const isActive = currentPath === link.path ||
                    (link.path !== '/' && currentPath.startsWith(link.path));
                  return (
                    <motion.li
                      key={link.path}
                      initial={prefersReduced ? {} : { opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.055, duration: 0.28 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => { onClose(); announceToScreenReader(`Navigated to ${link.label}`); }}
                        aria-current={isActive ? 'page' : undefined}
                        className={[
                          'flex items-center gap-3 py-4 px-4 rounded',
                          'font-mono text-xs uppercase tracking-widest',
                          'border-b border-border/40 transition-all duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-primary/60',
                          isActive ? 'text-primary' : 'text-text-muted hover:text-text hover:bg-surface/40',
                        ].join(' ')}
                      >
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                        )}
                        {!isActive && (
                          <span className="w-1.5 h-1.5 rounded-full border border-border shrink-0" aria-hidden="true" />
                        )}
                        {link.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            {/* Bottom actions */}
            <div className="p-6 space-y-4 border-t border-border">
              {/* Theme toggle in drawer */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Theme</span>
                <CompactThemeToggle />
              </div>

              {/* Donate CTA */}
              <Link
                to="/donate"
                onClick={onClose}
                className={[
                  'flex items-center justify-center gap-2 w-full py-4',
                  'bg-primary text-primary-foreground',
                  'font-mono text-xs font-bold uppercase tracking-widest',
                  'hover:bg-brand-gold-light transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary/60',
                ].join(' ')}
                aria-label="Donate to Rebuilt Village — tax deductible 501(c)(3)"
              >
                <Heart size={13} aria-hidden="true" />
                Donate Now
              </Link>

              <p className="text-center text-[9px] font-mono text-text-muted/40 uppercase tracking-widest">
                501(c)(3) · Tax Deductible
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Scroll progress bar ─────────────────────────────────────────────────────
const ScrollProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const onScroll = () => {
      const el    = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (el.scrollTop / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [prefersReduced]);

  if (prefersReduced) return null;

  return (
    <div className="absolute bottom-0 left-0 w-full h-px bg-primary/10" aria-hidden="true">
      <div
        className="h-full bg-gradient-to-r from-brand-gold-dark via-brand-gold to-brand-gold-light"
        style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
      />
    </div>
  );
};

// ─── Main export ─────────────────────────────────────────────────────────────
export const ViewfinderNav: React.FC = () => {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location                    = useLocation();
  const hamburgerRef                = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Threshold matches the ImpactTicker fade range (0–50px) so the nav
    // slides up to top-0 exactly as the ticker becomes invisible.
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    hamburgerRef.current?.focus();
  }, []);

  // On hero page the nav starts transparent, then darkens on scroll
  const isHeroPage  = location.pathname === '/';
  const transparent = isHeroPage && !scrolled;

  return (
    <>
      <ViewfinderCursor />

      <header
        role="banner"
        className={[
          'fixed top-0 left-0 right-0 z-50',
          'transition-all duration-500 motion-reduce:transition-none border-t border-primary/15',
          transparent
            ? 'bg-transparent border-b border-transparent'
            : 'bg-brand-black/95 backdrop-blur-md border-b border-primary/12 shadow-xl',
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px] md:h-24">

            {/* ── Logo ───────────────────────────────────────────────────── */}
            <Link
              to="/"
              aria-label="Rebuilt Village — return to homepage"
              onClick={() => announceToScreenReader('Navigated to Home')}
              className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-primary/60 rounded"
            >
              {/* Actual logo image */}
              <img
                src="/assets/brand/logo-icon.svg"
                alt="Rebuilt Village Logo"
                width={56}
                height={56}
                className="h-12 md:h-14 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {/* Text wordmark — shown alongside or as fallback */}
              <div className="flex flex-col leading-none">
                <span
                  className={[
                    'font-display font-semibold uppercase tracking-[0.18em] text-sm md:text-base',
                    'transition-colors duration-300 group-hover:text-primary',
                    transparent ? 'text-white' : 'text-primary',
                  ].join(' ')}
                >
                  Rebuilt Village
                </span>
              </div>
            </Link>

            {/* ── Desktop nav links ───────────────────────────────────────── */}
            <nav aria-label="Main navigation" className="hidden md:flex items-center">
              <ul className="flex items-center" role="list">
                {NAV_LINKS.map(link => {
                  const isActive = location.pathname === link.path ||
                    ((link.path as string) !== '/' && location.pathname.startsWith(link.path));
                  return (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => announceToScreenReader(`Navigated to ${link.label}`)}
                        className={[
                          'relative px-4 py-2 inline-block',
                          'font-mono text-[11px] uppercase tracking-widest',
                          'transition-colors duration-200 group',
                          'focus:outline-none focus:ring-2 focus:ring-primary/60 rounded',
                          isActive
                            ? 'text-primary'
                            : transparent
                              ? 'text-white/65 hover:text-white dark:text-white/65 dark:hover:text-white drop-shadow-md'
                              : 'text-text-muted hover:text-text',
                        ].join(' ')}
                      >
                        {link.label}
                        {/* Active / hover underline */}
                        <span
                          className={[
                            'absolute bottom-0 left-4 right-4 h-px',
                            'bg-gradient-to-r from-brand-gold to-brand-gold-light',
                            'transition-transform duration-300 origin-left',
                            isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-75',
                          ].join(' ')}
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* ── Right controls ──────────────────────────────────────────── */}
            <div className="flex items-center gap-2 md:gap-3">

              {/* Theme toggle — desktop */}
              <div className="hidden md:block">
                <CompactThemeToggle />
              </div>

              {/* Donate — desktop */}
              <Link
                to="/donate"
                aria-label="Donate to Rebuilt Village — tax deductible"
                className={[
                  'hidden md:inline-flex items-center gap-2',
                  'px-5 py-2.5',
                  'font-mono text-[11px] font-bold uppercase tracking-widest',
                  'bg-primary text-primary-foreground',
                  'hover:bg-brand-gold-light hover:shadow-gold',
                  'transition-all duration-300',
                  'focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-[#0A0A0A]',
                  'animate-glow-pulse',
                ].join(' ')}
              >
                <Heart size={12} aria-hidden="true" />
                Donate
              </Link>

              {/* Hamburger — mobile */}
              <button
                ref={hamburgerRef}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav-drawer"
                aria-label="Open navigation menu"
                onClick={() => setMobileOpen(true)}
                className={[
                  'md:hidden p-2 rounded',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary/60',
                  transparent ? 'text-white/80 hover:text-white' : 'text-text-muted hover:text-text',
                ].join(' ')}
              >
                <Menu size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <ScrollProgress />
      </header>

      <MobileDrawer
        isOpen={mobileOpen}
        onClose={closeMobile}
        currentPath={location.pathname}
      />
    </>
  );
};
