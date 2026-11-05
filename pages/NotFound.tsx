import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { Section } from '../components/Section';
import { Button } from '../components/Button';

const LINKS = [
  { to: '/programs', label: 'Programs' },
  { to: '/events', label: 'Events' },
  { to: '/about', label: 'About us' },
  { to: '/contact', label: 'Contact' },
];

const NotFound = () => {
  usePageMeta(
    'Page Not Found — Rebuilt Village',
    'The page you are looking for does not exist. Return to the Rebuilt Village homepage.',
    { noindex: true },
  );
  return (
    <Section bg="black" className="pt-40 min-h-[70vh] flex items-center">
      <div className="max-w-xl mx-auto text-center">
        <p className="font-mono text-[10px] text-primary-text mb-4 uppercase tracking-[0.4em] font-bold">
          Error 404
        </p>
        <h1 className="text-5xl md:text-6xl font-serif italic tracking-tight text-text mb-6">
          This scene was cut
        </h1>
        <p className="text-text-muted leading-relaxed mb-10">
          We couldn&rsquo;t find the page you were looking for. It may have
          moved, or the link may be mistyped. Here are some places to start.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto">
              Go to the homepage
            </Button>
          </Link>
          <Link to="/donate">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Donate
            </Button>
          </Link>
        </div>
        <ul
          className="flex flex-wrap justify-center gap-x-8 gap-y-3"
          role="list"
        >
          {LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="font-mono text-xs uppercase tracking-widest text-primary-text hover:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
};

export default NotFound;
