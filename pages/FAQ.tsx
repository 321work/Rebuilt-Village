import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Mail } from 'lucide-react';
import { marked } from 'marked';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { Section } from '../components/Section';
import { getFaqs } from '../services/sanityService';

// ─── FAQ data ─────────────────────────────────────────────────────────────────
// Keep this in sync with the FAQPage JSON-LD block in index.html

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  category: 'organization' | 'programs' | 'donate' | 'participate';
}

const FAQS: FAQItem[] = [
  // ── Organization ──────────────────────────────────────────────────────────
  {
    category: 'organization',
    question: 'What is Rebuilt Village?',
    answer: (
      <>
        Rebuilt Village, Inc. is a 501(c)(3) nonprofit organization founded in January 2025 in Orlando, Florida.
        Our mission is to enrich the community by telling stories through the art of film and media — empowering
        local youth to capture and preserve narratives that are deeply personal. We were born from{' '}
        <a href="https://rebuiltminds.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Rebuilt Minds
        </a>
        , an Orlando-based production company.
      </>
    ),
  },
  {
    category: 'organization',
    question: 'Is Rebuilt Village a real 501(c)(3)?',
    answer: (
      <>
        Yes. Rebuilt Village, Inc. is a recognized 501(c)(3) tax-exempt nonprofit organization. Our IRS
        determination letter is on file and available upon request — contact us at{' '}
        <a href="mailto:hello@rebuiltvillage.org" className="text-primary hover:underline">
          hello@rebuiltvillage.org
        </a>
        . Our EIN will be listed publicly once the IRS determination is finalized.
      </>
    ),
  },
  {
    category: 'organization',
    question: "What is Rebuilt Village's relationship to Rebuilt Minds?",
    answer:
      'Rebuilt Minds is the Orlando-based production company that incubated Rebuilt Village. While they share founding leadership and a commitment to film as a community tool, they are separate legal entities. Rebuilt Minds handles commercial and professional production work; Rebuilt Village is the nonprofit arm focused entirely on youth education and community storytelling.',
  },
  {
    category: 'organization',
    question: 'Who runs Rebuilt Village?',
    answer: (
      <>
        Rebuilt Village is governed by a volunteer board of directors and led by Executive Director Tony Golden.
        Our current leadership team includes Steve Kohn (President), Amanda Baez (VP), Kenya Fulton (Treasurer),
        Jess Ayala (Secretary), and board members Aaron Tanyhill and Karen Rugerio. Learn more on our{' '}
        <Link to="/about" className="text-primary hover:underline">About page</Link>.
      </>
    ),
  },
  {
    category: 'organization',
    question: 'Where is Rebuilt Village located?',
    answer:
      'We are based in Orlando, Florida (Orange County). Our primary programming partner is the John H. Jackson Community Center in Orlando. We also partner with Dr. Phillips High School in Orlando for annual events.',
  },

  // ── Programs ──────────────────────────────────────────────────────────────
  {
    category: 'programs',
    question: 'What programs does Rebuilt Village offer?',
    answer: (
      <>
        We offer three core programs: a two-week Summer Cinematography Camp for youth ages 14–18 (held at
        John H. Jackson Community Center), ongoing Narrative Preservation Workshops open to all community
        members, and periodic masterclasses on topics like lighting, grip, and directing. All youth programs
        are completely free. See our{' '}
        <Link to="/programs" className="text-primary hover:underline">Programs page</Link> for details.
      </>
    ),
  },
  {
    category: 'programs',
    question: 'What is the Summer Cinematography Camp?',
    answer:
      'Our flagship program. Two weeks of full-day training (9 AM–3 PM, weekdays) at John H. Jackson Community Center in Orlando. Students work with Blackmagic Cinema and RED cameras, learn lighting and color grading, and premiere original short films at a closing community screening. The program is free for all accepted students. The 2026 session runs July 13–24.',
  },
  {
    category: 'programs',
    question: 'What is Film-apalooza?',
    answer:
      'Film-apalooza is a three-day community film festival held at Dr. Phillips High School in Orlando (May 15–17, 2026). It features community screenings, filmmaker panels, hands-on workshops, and an awards ceremony. Rebuilt Village is a proud sponsor and co-organizer. The event is open to all ages.',
  },
  {
    category: 'programs',
    question: 'What equipment do students use?',
    answer:
      "Students train on professional-grade Blackmagic Cinema cameras, RED cameras, and full lighting and grip setups — the same tools used on professional productions. Rebuilt Village's Film Equipment Fund supports ongoing gear acquisition. Students do not need to own equipment to participate.",
  },

  // ── Participate ───────────────────────────────────────────────────────────
  {
    category: 'participate',
    question: 'How do I enroll my child in a program?',
    answer: (
      <>
        Enrollment information for the 2026 Summer Camp will be announced via our events calendar and
        social media. In the meantime, you can{' '}
        <Link to="/contact" className="text-primary hover:underline">contact us</Link>{' '}
        to express interest and be notified when applications open. All youth programs are free and
        open to Orlando-area youth ages 14–18.
      </>
    ),
  },
  {
    category: 'participate',
    question: 'Can adults participate in workshops?',
    answer:
      'Yes. Our community workshops (Narrative Preservation Workshop, masterclass events) are open to all ages. The Summer Camp is designed specifically for youth ages 14–18. Check the Events calendar for upcoming community-facing sessions.',
  },
  {
    category: 'participate',
    question: 'How can I volunteer or partner with Rebuilt Village?',
    answer: (
      <>
        We welcome volunteers in production mentorship, event coordination, marketing, and community outreach.
        Organizations interested in sponsorship or partnership — including event co-sponsorship and
        in-kind equipment donations — should reach out via our{' '}
        <Link to="/contact" className="text-primary hover:underline">contact form</Link>.
        Corporate sponsorship packages are available for Film-apalooza 2026 and the Winter Gala.
      </>
    ),
  },

  // ── Donate ────────────────────────────────────────────────────────────────
  {
    category: 'donate',
    question: 'Are donations to Rebuilt Village tax-deductible?',
    answer:
      'Yes. Rebuilt Village, Inc. is a 501(c)(3) organization and your contribution is tax-deductible to the full extent permitted by law. After each donation you will receive an official tax receipt by email with the relevant details for your records.',
  },
  {
    category: 'donate',
    question: 'How is my donation used?',
    answer:
      'Donations support film education, equipment, mentorship, student materials, and organizational operations. You can give to the General Operating Fund or direct your gift to a specific restricted project: the Film Equipment Fund, Youth Scholarship Fund, Summer Camp Launch, or Film-apalooza sponsorship.',
  },
  {
    category: 'donate',
    question: 'Can I make a recurring monthly donation?',
    answer: (
      <>
        Yes — and monthly donors are some of our most impactful supporters. You can choose a monthly
        frequency on the{' '}
        <Link to="/donate" className="text-primary hover:underline">Donate page</Link>.
        Monthly gifts are processed via Stripe and can be cancelled at any time by contacting us.
      </>
    ),
  },
  {
    category: 'donate',
    question: 'Does my employer match donations?',
    answer:
      'Many employers match charitable contributions to 501(c)(3) organizations — sometimes dollar-for-dollar or more. Contact your HR department to check eligibility. If your employer requires documentation, contact us and we will provide the necessary verification materials.',
  },
  {
    category: 'donate',
    question: 'Can I make a donation in honor or memory of someone?',
    answer: (
      <>
        Yes. On the{' '}
        <Link to="/donate" className="text-primary hover:underline">Donate page</Link>
        {' '}you can add a tribute or memorial note. The honoree's name will appear on your
        official tax receipt.
      </>
    ),
  },
];

// ─── Category labels ──────────────────────────────────────────────────────────
const CATEGORIES: { id: FAQItem['category']; label: string; color: string }[] = [
  { id: 'organization', label: 'Organization',      color: '#1B4FBE' },
  { id: 'programs',     label: 'Programs & Events', color: '#4A9E52' },
  { id: 'participate',  label: 'Get Involved',       color: '#2DBFA0' },
  { id: 'donate',       label: 'Donating',           color: '#C9A84C' },
];

// ─── Accordion item ───────────────────────────────────────────────────────────
interface AccordionItemProps {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ item, index, isOpen, onToggle }) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className={`border transition-colors duration-300 ${
        isOpen ? 'border-primary/40 bg-surface/60' : 'border-border bg-surface/20 hover:border-border/80'
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-6 p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-inset"
      >
        <span className={`font-serif italic text-xl leading-snug transition-colors duration-200 ${
          isOpen ? 'text-primary' : 'text-text'
        }`}>
          {item.question}
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`shrink-0 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      <motion.div
        initial={false}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: prefersReduced ? 0 : 0.28, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 text-text-muted font-light leading-relaxed text-[15px]">
          {item.answer}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── FAQ Page ─────────────────────────────────────────────────────────────────
export const FAQ: React.FC = () => {
  usePageMeta(
    'FAQ — Rebuilt Village',
    'Answers to common questions about Rebuilt Village programs, how to donate, volunteer, and enroll youth in film education.'
  );
  const [openId, setOpenId]         = useState<string | null>(null);
  const [activeCategory, setActiveCat] = useState<FAQItem['category'] | 'all'>('all');
  const [allFaqs, setAllFaqs] = useState<FAQItem[]>(FAQS);

  useEffect(() => {
    getFaqs().then((cmsFaqs) => {
      if (cmsFaqs.length > 0) {
        setAllFaqs(cmsFaqs.map((f) => ({
          question: f.question,
          answer: <span dangerouslySetInnerHTML={{ __html: marked.parse(f.answer) as string }} />,
          category: (f.category ?? 'organization') as FAQItem['category'],
        })));
      }
    }).catch(() => { /* keep hardcoded */ });
  }, []);

  const filtered = activeCategory === 'all'
    ? allFaqs
    : allFaqs.filter(f => f.category === activeCategory);

  function toggle(question: string) {
    setOpenId(prev => (prev === question ? null : question));
  }

  return (
    <article aria-label="Frequently asked questions about Rebuilt Village">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Section bg="black" className="pt-32">
        <div className="text-center">
          <p className="font-mono text-[10px] text-primary mb-4 uppercase tracking-[0.4em] font-bold opacity-60">
            Scene Notes
          </p>
          <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-text mb-8">
            Frequently Asked Questions
          </h1>
          <div className="h-1 w-24 bg-primary/30 mx-auto mb-10" />
          <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-light">
            Everything you need to know about our programs, events, and how to give.
            Can't find your answer?{' '}
            <Link to="/contact" className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded">
              Ask us directly.
            </Link>
          </p>
        </div>
      </Section>

      {/* ── Category filter ───────────────────────────────────────────────── */}
      <Section bg="black">
        <div className="max-w-3xl mx-auto">

          <div
            role="tablist"
            aria-label="Filter FAQ by category"
            className="flex flex-wrap gap-3 mb-14 justify-center"
          >
            <button
              role="tab"
              aria-selected={activeCategory === 'all'}
              onClick={() => { setActiveCat('all'); setOpenId(null); }}
              className={`font-mono text-[10px] uppercase tracking-widest px-4 py-2 border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                activeCategory === 'all'
                  ? 'bg-primary border-primary text-black'
                  : 'border-border text-text-muted hover:border-primary/50 hover:text-text'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeCategory === cat.id}
                onClick={() => { setActiveCat(cat.id); setOpenId(null); }}
                className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                style={{
                  borderColor: activeCategory === cat.id ? cat.color : undefined,
                  color:       activeCategory === cat.id ? cat.color : undefined,
                  backgroundColor: activeCategory === cat.id ? `${cat.color}15` : undefined,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* ── Accordion ──────────────────────────────────────────────────── */}
          <div className="space-y-3" role="list" aria-label="FAQ answers">
            {filtered.map((item, idx) => (
              <AccordionItem
                key={item.question}
                item={item}
                index={idx}
                isOpen={openId === item.question}
                onToggle={() => toggle(item.question)}
              />
            ))}
          </div>

          {/* ── Still have questions ──────────────────────────────────────── */}
          <div className="mt-20 text-center border border-dashed border-border p-12 bg-surface-highlight">
            <Mail size={28} className="text-primary mx-auto mb-5" aria-hidden="true" />
            <h3 className="text-text font-serif italic text-2xl mb-4">Still have a question?</h3>
            <p className="text-text-muted text-sm font-light mb-8 max-w-sm mx-auto leading-relaxed">
              Our team typically responds within one business day.
            </p>
            <Link to="/contact">
              <button className="font-mono text-[10px] uppercase tracking-widest px-8 py-3 border border-primary text-primary hover:bg-primary hover:text-black transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </Section>

    </article>
  );
};
