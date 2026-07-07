/**
 * Post-build SSG prerender script.
 * Run after `vite build`: node prerender.cjs
 *
 * Starts a local server serving dist/, then uses Puppeteer to render each
 * static route and writes the resulting HTML into dist/{route}/index.html.
 * Firebase Hosting serves these files directly so crawlers get full HTML.
 *
 * Donate, DonateSuccess, and Contact are intentionally excluded — they need
 * live Stripe/Firestore and offer no meaningful crawler value.
 */

'use strict';

const http     = require('http');
const fs       = require('fs');
const path     = require('path');
const { execSync } = require('child_process');

const DIST_DIR = path.join(__dirname, 'dist');

const STATIC_ROUTES = [
  '/',
  '/about',
  '/programs',
  '/events',
  '/faq',
  '/blog',
  '/board',
  '/documents',
  '/privacy',
  '/terms',
  '/accessibility',
];

// Minimal static file server for the dist directory.
// We capture the original index.html ONCE so that subsequent route renders
// don't receive the overwritten homepage HTML (which would cause React error #418).
function createServer(port) {
  const mime = {
    '.html': 'text/html',
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.json': 'application/json',
    '.txt':  'text/plain',
    '.xml':  'application/xml',
    '.woff2':'font/woff2',
  };

  // Capture clean SPA shell before any prerender writes touch it.
  const spaShell = fs.readFileSync(path.join(DIST_DIR, 'index.html'));

  const server = http.createServer((req, res) => {
    let filePath = path.join(DIST_DIR, req.url.split('?')[0]);
    const ext = path.extname(filePath);
    if (!ext) {
      // Route — always serve the original SPA shell (not a potentially-mutated file)
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(spaShell);
      return;
    }
    const contentType = mime[ext] || 'application/octet-stream';
    try {
      const data = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    } catch {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(spaShell);
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function prerender() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('dist/ not found — run `vite build` first.');
    process.exit(1);
  }

  const PORT = 5050;
  const server = await createServer(PORT);
  console.log(`[prerender] serving dist on http://localhost:${PORT}`);

  // Use the top-level puppeteer dev dep (ships current Chrome).
  const puppeteer = require('puppeteer');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  let errors = 0;

  for (const route of STATIC_ROUTES) {
    const url = `http://localhost:${PORT}${route}`;
    console.log(`[prerender] rendering ${url}`);
    const page = await browser.newPage();

    page.on('pageerror', (err) => console.warn(`  [page error] ${err.message}`));

    try {
      // networkidle0 never fires with Firebase (persistent WebSocket connections).
      // Load the page, then wait a fixed 3s for React + Firestore hydration.
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await new Promise((r) => setTimeout(r, 3000));

      const html = await page.content();

      // Write to dist/{route}/index.html (dist/index.html for root).
      const outDir = route === '/'
        ? DIST_DIR
        : path.join(DIST_DIR, ...route.slice(1).split('/'));
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
      console.log(`  ✓ wrote ${path.join(outDir, 'index.html')}`);
    } catch (err) {
      console.error(`  ✗ failed: ${err.message}`);
      errors++;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();

  if (errors > 0) {
    console.error(`[prerender] ${errors} route(s) failed.`);
    process.exit(1);
  }
  console.log('[prerender] done.');
}

prerender().catch((err) => {
  console.error('[prerender] fatal:', err);
  process.exit(1);
});
